import { mapLimit } from 'async';
import chunk from 'lodash/chunk';
import compact from 'lodash/compact';
import flatten from 'lodash/flatten';
import isEmpty from 'lodash/isEmpty';
import omit from 'lodash/omit';
import uniq from 'lodash/uniq';
import type { NextApiRequest, NextApiResponse } from 'next';

import { EHttpStatusCode } from '@apis/errors';
import {
  prepareNewOrderDetailPlan,
  queryAllListings,
} from '@helpers/apiHelpers';
import cookies from '@services/cookie';
import { fetchUser } from '@services/integrationHelper';
import { getIntegrationSdk } from '@services/integrationSdk';
import { createFirebaseDocNotification } from '@services/notifications';
import { getSdk, handleError } from '@services/sdk';
import {
  EBookerOrderDraftStates,
  ECompanyPermission,
  EListingType,
  ENotificationType,
  EOrderDraftStates,
  EOrderStates,
  EOrderType,
} from '@src/utils/enums';
import type { TListing } from '@src/utils/types';
import { denormalisedResponseEntities, Listing, User } from '@utils/data';

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
    const userId = currentUserGetter.getId();

    const companyAccount = await fetchUser(companyId);
    const companyUserGetter = User(companyAccount);
    const { companyName } = companyUserGetter.getPublicData();
    const { members = {} } = companyUserGetter.getMetadata();
    const userMember = members[userEmail] || {};

    if (!isEmpty(userCompany)) {
      if (
        userCompany[companyId] &&
        userCompany[companyId].permission in ECompanyPermission
      ) {
        return res.json({
          statusCode: EHttpStatusCode.BadRequest,
          message: 'User is already in company',
        });
      }

      await integrationSdk.users.updateProfile({
        id: companyId,
        metadata: {
          members: omit(members, [userEmail]),
        },
      });

      return res.json({
        statusCode: EHttpStatusCode.BadRequest,
        error: `User already has company`,
      });
    }

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
              permission:
                userMember.permission || ECompanyPermission.participant,
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
    const allNeedUpdatePlanIds: string[] = uniq(
      compact(
        allNeedOrders.map((order: TListing) => {
          const { plans = [] } = Listing(order).getMetadata();

          return plans[0];
        }),
      ),
    );

    const allNeedUpdatePlans: TListing[] = flatten(
      await Promise.all(
        chunk<string>(allNeedUpdatePlanIds, 100).map(async (ids) => {
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
          newMemberIds: [userId],
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
