import compact from 'lodash/compact';
import difference from 'lodash/difference';
import { DateTime } from 'luxon';

import { sendIndividualEmail } from '@services/awsSES';
import { emailSendingFactory, EmailTemplateTypes } from '@services/email';
import { fetchUser } from '@services/integrationHelper';
import { getIntegrationSdk } from '@services/integrationSdk';
import { createFirebaseDocNotification } from '@services/notifications';
import { UserInviteStatus, UserPermission } from '@src/types/UserPermission';
import participantCompanyInvitation, {
  participantCompanyInvitationSubject,
} from '@src/utils/emailTemplate/participantCompanyInvitation';
import { ENotificationType } from '@src/utils/enums';
import { denormalisedResponseEntities, User } from '@utils/data';

const defaultExpireTime =
  parseInt(process.env.DEFAUTL_INVITATION_EMAIL_EXPIRE_TIME as string, 10) || 7;
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
  // Step calculate expire time of invitation email
  const expireTime = DateTime.now()
    .setZone('Asia/Ho_Chi_Minh')
    .startOf('day')
    .plus({ day: defaultExpireTime })
    .toMillis();

  // Step update data for existed user
  const newParticipantMembers = await Promise.all(
    difference(userIdList, membersIdList).map(async (userId: string) => {
      const userAccount = await fetchUser(userId);
      const { companyList: userCompanyList = [] } =
        User(userAccount).getMetadata();
      await integrationSdk.users.updateProfile({
        id: userId,
        metadata: {
          companyList: Array.from(new Set([...userCompanyList, companyId])),
        },
      });
      const { email: userEmail } = User(userAccount).getAttributes();

      return {
        [userEmail]: {
          id: userId,
          email: userEmail,
          permission: UserPermission.PARTICIPANT,
          groups: [],
          inviteStatus: UserInviteStatus.NOT_ACCEPTED,
          expireTime,
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
      inviteStatus: UserInviteStatus.NOT_ACCEPTED,
      expireTime,
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
      createFirebaseDocNotification(ENotificationType.ORDER_DELIVERING, {
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
