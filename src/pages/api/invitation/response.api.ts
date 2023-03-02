import cookies from '@services/cookie';
import { fetchUser } from '@services/integrationHelper';
import { getIntegrationSdk } from '@services/integrationSdk';
import { getSdk, handleError } from '@services/sdk';
import {
  UserInviteResponse,
  UserInviteStatus,
  UserPermission,
} from '@src/types/UserPermission';
import { denormalisedResponseEntities, User } from '@utils/data';
import { DateTime } from 'luxon';
import type { NextApiRequest, NextApiResponse } from 'next';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const sdk = getSdk(req, res);
  const integrationSdk = getIntegrationSdk();
  try {
    const { companyId = '', response } = req.body;

    const currentUser = denormalisedResponseEntities(
      await sdk.currentUser.show(),
    )[0];
    const { email: userEmail } = User(currentUser).getAttributes();
    const { company: userCompany = {} } = User(currentUser).getMetadata();
    const userId = User(currentUser).getId();

    const companyAccount = await fetchUser(companyId);
    const { members = {} } = User(companyAccount).getMetadata();
    const userMember = members[userEmail];

    const { expireTime = 0 } = userMember;
    const todayTimestamp = DateTime.now()
      .setZone('Asia/Ho_Chi_Minh')
      .toMillis();

    if (expireTime <= todayTimestamp) {
      return res.json({
        message: 'invitationExpired',
      });
    }

    if (response === UserInviteResponse.DECLINE) {
      const newMembers = {
        ...members,
        [userEmail]: {
          ...userMember,
          inviteStatus: UserInviteStatus.DECLINED,
        },
      };
      await integrationSdk.users.updateProfile({
        id: companyId,
        metadata: {
          members: newMembers,
        },
      });
      return res.json({
        message: 'userDecline',
      });
    }

    const newMembers = {
      ...members,
      [userEmail]: {
        ...userMember,
        inviteStatus: UserInviteStatus.ACCEPTED,
        id: userId,
      },
    };
    await integrationSdk.users.updateProfile({
      id: companyId,
      metadata: {
        members: newMembers,
      },
    });
    await integrationSdk.users.updateProfile({
      id: userId,
      metadata: {
        company: {
          ...userCompany,
          [companyId]: {
            permission: UserPermission.PARTICIPANT,
          },
        },
      },
    });
    return res.json({
      message: 'userAccept',
    });
  } catch (error) {
    handleError(res, error);
  }
}

export default cookies(handler);
