import { createEmailParams, sendEmail } from '@services/awsSES';
import cookies from '@services/cookie';
import { fetchUser } from '@services/integrationHelper';
import { getIntegrationSdk } from '@services/integrationSdk';
import companyChecker from '@services/permissionChecker/company';
import { handleError } from '@services/sdk';
import { UserInviteStatus, UserPermission } from '@src/types/UserPermission';
import { denormalisedResponseEntities, User } from '@utils/data';
import { companyInvitation } from '@utils/emailTemplate/companyInvitation';
import uniqBy from 'lodash/uniqBy';
import { DateTime } from 'luxon';
import type { NextApiRequest, NextApiResponse } from 'next';

const defaultExpireTime =
  parseInt(process.env.DEFAUTL_INVITATION_EMAIL_EXPIRE_TIME as string, 10) || 7;
const baseUrl = process.env.NEXT_PUBLIC_CANONICAL_URL;
const systemSenderEmail = process.env.AWS_SES_SENDER_EMAIL;
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const integrationSdk = getIntegrationSdk();
  try {
    const { userIdList, noAccountEmailList, companyId } = req.body;

    // Step calculate expire time of invitation email
    const expireTime = DateTime.now()
      .setZone('Asia/Ho_Chi_Minh')
      .startOf('day')
      .plus({ day: defaultExpireTime })
      .toMillis();

    // Step update data for existed user
    const newParticipantMembers = await Promise.all(
      userIdList.map(async (userId: string) => {
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
    const newNoAccountMembers = noAccountEmailList
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
    const companyAccount = await fetchUser(companyId);
    const { members = {} } = User(companyAccount).getMetadata();
    const newCompanyMembers = uniqBy(
      {
        ...members,
        ...newNoAccountMembers,
        ...newParticipantMembersObj,
      },
      'email',
    );

    const updatedCompanyAccountResponse =
      await integrationSdk.users.updateProfile({
        id: companyId,
        metadata: {
          members: newCompanyMembers,
        },
      });

    const [updatedCompanyAccount] = denormalisedResponseEntities(
      updatedCompanyAccountResponse,
    );

    const newParticipantMembersEmailTemplate = companyInvitation({
      companyName: User(companyAccount).getPublicData().companyName,
      url: `${baseUrl}/invitation/${companyId}`,
    });
    // Step handle send email for new participant members
    const hasFlexAccountEmailParamsData = {
      receiver: Object.keys(newParticipantMembersObj),
      subject: 'PITO Cloud Canteen - Bạn có một lời mời tham gia công ty',
      content: newParticipantMembersEmailTemplate,
      sender: systemSenderEmail as string,
    };
    const hasFlexAccountEmailParams = createEmailParams(
      hasFlexAccountEmailParamsData.receiver,
      hasFlexAccountEmailParamsData.subject,
      hasFlexAccountEmailParamsData.content,
      hasFlexAccountEmailParamsData.sender,
    );
    if (hasFlexAccountEmailParamsData.receiver.length > 0) {
      sendEmail(hasFlexAccountEmailParams);
    }
    // Step handle send email for new no account members

    const noFlexAccountEmailParamsData = {
      receiver: noAccountEmailList,
      subject: 'PITO Cloud Canteen - Bạn có một lời mời tham gia công ty',
      content: newParticipantMembersEmailTemplate,
      sender: systemSenderEmail as string,
    };
    const noFlexAccountEmailParams = createEmailParams(
      noFlexAccountEmailParamsData.receiver,
      noFlexAccountEmailParamsData.subject,
      noFlexAccountEmailParamsData.content,
      noFlexAccountEmailParamsData.sender,
    );
    if (noFlexAccountEmailParamsData.receiver.length > 0) {
      sendEmail(noFlexAccountEmailParams);
    }
    res.json(updatedCompanyAccount);
  } catch (error) {
    handleError(res, error);
  }
};

export default cookies(companyChecker(handler));
