import { mapLimit } from 'async';
import { isEmpty, uniq } from 'lodash';
import compact from 'lodash/compact';
import difference from 'lodash/difference';
import flatten from 'lodash/flatten';

import {
  convertListIdToQueries,
  prepareNewOrderDetailPlan,
  queryAllListings,
} from '@helpers/apiHelpers';
import { sendIndividualEmail } from '@services/awsSES';
import { emailSendingFactory, EmailTemplateTypes } from '@services/email';
import { fetchUser } from '@services/integrationHelper';
import { getIntegrationSdk } from '@services/integrationSdk';
import { createFirebaseDocNotification } from '@services/notifications';
import { UserInviteStatus, UserPermission } from '@src/types/UserPermission';
import participantCompanyInvitation, {
  participantCompanyInvitationSubject,
} from '@src/utils/emailTemplate/participantCompanyInvitation';
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

const systemSenderEmail = process.env.AWS_SES_SENDER_EMAIL;

type TAddMembersToCompanyParams = {
  userIdList: string[];
  noAccountEmailList: string[];
  companyId: string;
  bookerName?: string;
};

const addMembersToCompanyFn = async (params: TAddMembersToCompanyParams) => {
  const { userIdList, noAccountEmailList, companyId, bookerName } = params;
  const integrationSdk = getIntegrationSdk();
  const companyAccount = await fetchUser(companyId);
  const companyUser = User(companyAccount);
  const { companyName } = companyUser.getPublicData();
  const { firstName, lastName } = companyUser.getProfile();
  const companyBookerName = `${lastName} ${firstName}`;
  const { members = {} } = companyUser.getMetadata();
  const membersIdList = compact(
    Object.values(members).map((_member: any) => _member?.id),
  );
  const membersEmailList = Object.keys(members);

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
  const allNeedUpdatePlans = flatten(
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

  // Step update data for existed user
  const newParticipantIds = difference(userIdList, membersIdList);
  const newParticipantMembers = await Promise.all(
    newParticipantIds.map(async (userId: string) => {
      const userAccount = await fetchUser(userId);
      const { companyList: userCompanyList = [] } =
        User(userAccount).getMetadata();
      await integrationSdk.users.updateProfile({
        id: userId,
        metadata: {
          companyList: Array.from(new Set([...userCompanyList, companyId])),
          company: {
            [companyId]: {
              permission: UserPermission.PARTICIPANT,
            },
          },
        },
      });
      const { email: userEmail } = User(userAccount).getAttributes();

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

      return {
        [userEmail]: {
          id: userId,
          email: userEmail,
          permission: UserPermission.PARTICIPANT,
          groups: [],
          inviteStatus: UserInviteStatus.ACCEPTED,
        },
      };
    }),
  );
  const newParticipantMembersObj = newParticipantMembers.reduce(
    (result, item) => {
      return {
        ...result,
        ...item,
      };
    },
    {},
  );

  // Step format no account email list to company member object
  const newNoAccountMembers = difference(noAccountEmailList, membersEmailList)
    .map((email: string) => ({
      email,
      id: null,
      permission: UserPermission.PARTICIPANT,
      groups: [],
      inviteStatus: UserInviteStatus.ACCEPTED,
    }))
    .reduce((result: any, memberObj: any) => {
      return {
        ...result,
        [memberObj.email]: { ...memberObj },
      };
    }, {});

  // Step update company account metadata
  const newCompanyMembers = {
    ...members,
    ...newNoAccountMembers,
    ...newParticipantMembersObj,
  };

  const updatedCompanyAccountResponse =
    await integrationSdk.users.updateProfile(
      {
        id: companyId,
        metadata: {
          members: newCompanyMembers,
        },
      },
      {
        include: ['profileImage'],
        expand: true,
      },
    );

  const [updatedCompanyAccount] = denormalisedResponseEntities(
    updatedCompanyAccountResponse,
  );

  const participantMemberIds = difference(userIdList, membersIdList);

  // Step handle send email for new participant members
  if (Object.keys(newParticipantMembersObj).length > 0) {
    await Promise.all(
      participantMemberIds.map(async (userId: string) => {
        await emailSendingFactory(
          EmailTemplateTypes.PARTICIPANT.PARTICIPANT_COMPANY_INVITATION,
          {
            participantId: userId,
            companyId,
          },
        );
      }),
    );

    participantMemberIds.map(async (participantId: string) => {
      createFirebaseDocNotification(ENotificationType.INVITATION, {
        userId: participantId,
        companyName,
        companyId,
        bookerName: bookerName || companyBookerName,
      });
    });
  }
  // Step handle send email for new no account members
  const emailTemplate = participantCompanyInvitation({
    companyUser,
  });

  const noFlexAccountEmailParamsData = {
    receiver: noAccountEmailList,
    subject: participantCompanyInvitationSubject(companyName),
    content: emailTemplate as string,
    sender: systemSenderEmail as string,
  };
  if (noAccountEmailList.length > 0) {
    sendIndividualEmail(noFlexAccountEmailParamsData);
  }

  return updatedCompanyAccount;
};

export default addMembersToCompanyFn;
