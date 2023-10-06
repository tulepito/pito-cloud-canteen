import { mapLimit } from 'async';
import compact from 'lodash/compact';
import flatten from 'lodash/flatten';
import isEmpty from 'lodash/isEmpty';
import uniq from 'lodash/uniq';
import type { NextApiRequest, NextApiResponse } from 'next';

import {
  convertListIdToQueries,
  prepareNewOrderDetailPlan,
  queryAllListings,
} from '@helpers/apiHelpers';
import cookies from '@services/cookie';
import { fetchUser } from '@services/integrationHelper';
import { getIntegrationSdk } from '@services/integrationSdk';
import { createFirebaseDocNotification } from '@services/notifications';
import { getSdk, handleError } from '@services/sdk';
import { UserPermission } from '@src/types/UserPermission';
import {
  EBookerOrderDraftStates,
  EListingType,
  ENotificationType,
  EOrderDraftStates,
  EOrderStates,
  EOrderType,
} from '@src/utils/enums';
import type { TListing } from '@src/utils/types';
import { denormalisedResponseEntities, Listing, User } from '@utils/data';

const ENABLE_INVITE_PERMISSION = [
  UserPermission.PARTICIPANT,
  UserPermission.BOOKER,
  UserPermission.ACCOUNTANT,
];

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const sdk = getSdk(req, res);
  const integrationSdk = getIntegrationSdk();
  try {
    const { companyId = '' } = req.body;

    const currentUser = denormalisedResponseEntities(
      await sdk.currentUser.show(),
    )[0];

    const currentUserGetter = User(currentUser);
    const { email: userEmail } = currentUserGetter.getAttributes();
    const { company: userCompany = {}, companyList = [] } =
      currentUserGetter.getMetadata();
    const userId = User(currentUser).getId();

    if (
      userCompany[userId] &&
      ENABLE_INVITE_PERMISSION.includes(userCompany[userId].permission)
    ) {
      return res.json({
        message: 'userAccept',
      });
    }
    const companyAccount = await fetchUser(companyId);
    const companyUser = User(companyAccount);
    const { companyName } = companyUser.getPublicData();
    const { members = {} } = companyUser.getMetadata();
    const userMember = members[userEmail] || {};

    if (isEmpty(userMember)) {
      return res.json({
        message: 'invalidInvitation',
      });
    }

    const newMembers = {
      ...members,
      [userEmail]: {
        ...userMember,
        id: userId,
      },
    };

    await integrationSdk.users.updateProfile({
      id: companyId,
      metadata: {
        members: newMembers,
      },
    });
    if (!companyList.includes(companyId)) {
      await integrationSdk.users.updateProfile({
        id: userId,
        metadata: {
          companyList: [...companyList, companyId],
          company: {
            ...userCompany,
            [companyId]: {
              permission: userMember.permission || UserPermission.PARTICIPANT,
            },
          },
        },
      });
    }

    createFirebaseDocNotification(ENotificationType.COMPANY_JOINED, {
      userId,
      companyName,
    });

    // TODO: update picking for new member
    // Step 1: query picking order
    const allNeedOrders = await queryAllListings({
      query: {
        meta_listingType: EListingType.order,
        meta_orderType: EOrderType.group,
        meta_orderState: `${[
          EOrderStates.picking,
          EOrderDraftStates.draft,
          EOrderDraftStates.pendingApproval,
          EBookerOrderDraftStates.bookerDraft,
        ].join(',')}`,
        meta_companyId: companyId,
        meta_selectedGroups: 'has_any:allMembers',
      },
    });
    const allNeedUpdatePlanIds = uniq(
      compact(
        allNeedOrders.map((order: TListing) => {
          const { plans = [] } = Listing(order).getMetadata();

          return plans[0];
        }),
      ),
    );
    const planQueries = convertListIdToQueries({
      idList: allNeedUpdatePlanIds,
    });
    const allNeedUpdatePlans: TListing[] = flatten(
      await Promise.all(
        planQueries.map(async ({ ids }) => {
          return denormalisedResponseEntities(
            await integrationSdk.listings.query({
              ids,
            }),
          );
        }),
      ),
    );

    // Step 2. Create update function
    const updateFn = async (order: TListing) => {
      const orderId = Listing(order).getId();
      const {
        participants = [],
        anonymous = [],
        plans = [],
      } = Listing(order).getMetadata();

      // todo: if user already in participant list, stop update process
      if (participants.includes(userId)) {
        return;
      }

      await integrationSdk.listings.update({
        id: orderId,
        metadata: {
          participants: uniq(participants.concat(userId)),
          anonymous: anonymous.filter((id: string) => id !== userId),
        },
      });

      // todo: if user already in anonymous list, stop update process
      if (anonymous.includes(userId)) {
        return;
      }

      const planId = plans[0];
      if (!isEmpty(planId)) {
        const planListing = allNeedUpdatePlans.find(
          (p: TListing) => p.id.uuid === planId,
        );

        const newOrderDetail = prepareNewOrderDetailPlan({
          planListing: planListing!,
          newMemberId: userId,
        });
        await integrationSdk.listings.update({
          id: planId,
          metadata: {
            orderDetail: newOrderDetail,
          },
        });
      }
    };
    // Step 3. Call function update data
    mapLimit(allNeedOrders, 10, updateFn);

    return res.json({
      message: 'userAccept',
    });
  } catch (error) {
    handleError(res, error);
  }
}

export default cookies(handler);
