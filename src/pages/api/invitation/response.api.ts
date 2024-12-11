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
import logger from '@helpers/logger';
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

type InviteStatus = 'accepted' | 'declined';
type InviteResponse = 'accept' | 'decline';
type InviteSource = 'invitation-link';
export interface ResponseToInvitationBody {
  response: InviteResponse;
  companyId: string;
  source?: InviteSource;
}

interface Member {
  email: string;
  groups: string[];
  id: string;
  inviteStatus: InviteStatus;
  permission: ECompanyPermission;
}

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const sdk = getSdk(req, res);
  const integrationSdk = getIntegrationSdk();
  try {
    const { companyId = '', source } = req.body as ResponseToInvitationBody;

    const currentUser = denormalisedResponseEntities(
      await sdk.currentUser.show(),
    )[0];

    const currentUserGetter = User(currentUser);
    const { email: userEmail } = currentUserGetter.getAttributes();
    const { company: userCompany = {}, companyList = [] } =
      currentUserGetter.getMetadata();
    const userId = currentUserGetter.getId();

    if (currentUser?.attributes?.profile?.metadata?.isPartner) {
      return res.status(EHttpStatusCode.BadRequest).json({
        statusCode: EHttpStatusCode.BadRequest,
        message: 'Tài khoản này là đối tác, không thể tham gia công ty',
      });
    }

    const companyAccount = await fetchUser(companyId);
    const companyUserGetter = User(companyAccount);
    const { companyName } = companyUserGetter.getPublicData();
    const { members = {} } = companyUserGetter.getMetadata();
    let userMember: Member = members[userEmail] || {};

    if (source === 'invitation-link' && isEmpty(userMember)) {
      userMember = {
        email: userEmail,
        groups: [],
        id: userId,
        inviteStatus: 'accepted',
        permission: ECompanyPermission.participant,
      };
    }

    if (!isEmpty(userCompany)) {
      const currentCompanyId = Object.keys(userCompany)[0];

      if (
        userCompany[currentCompanyId] &&
        userCompany[currentCompanyId].permission in ECompanyPermission
      ) {
        if (currentCompanyId === companyId) {
          return res.status(EHttpStatusCode.Ok).json({
            message: 'Người dùng đã nằm trong công ty',
            userType: userCompany[currentCompanyId].permission,
          });
        }

        return res.status(EHttpStatusCode.BadRequest).json({
          statusCode: EHttpStatusCode.BadRequest,
          message: 'Tài khoản này đã thuộc một công ty khác',
        });
      }

      if (currentCompanyId !== companyId) {
        return res.status(EHttpStatusCode.BadRequest).json({
          statusCode: EHttpStatusCode.BadRequest,
          message: 'Tài khoản này đã thuộc một công ty khác',
        });
      }

      await integrationSdk.users.updateProfile({
        id: companyId,
        metadata: {
          members: omit(members, [userEmail]),
        },
      });

      return res.json({
        message: 'User has been successfully added to the company',
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
    logger.info('Error responseToInvitation', String(error));
    handleError(res, error);
  }
}

export default cookies(handler);
