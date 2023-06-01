import { DateTime } from 'luxon';
import type { NextApiRequest, NextApiResponse } from 'next';

import cookies from '@services/cookie';
import { fetchUser } from '@services/integrationHelper';
import { getIntegrationSdk } from '@services/integrationSdk';
import { createFirebaseDocNotification } from '@services/notifications';
import { getSdk, handleError } from '@services/sdk';
import {
  UserInviteResponse,
  UserInviteStatus,
  UserPermission,
} from '@src/types/UserPermission';
import { ENotificationType } from '@src/utils/enums';
import { denormalisedResponseEntities, User } from '@utils/data';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const sdk = getSdk(req, res);
  const integrationSdk = getIntegrationSdk();
  try {
    const { companyId = '', response } = req.body;

    const currentUser = denormalisedResponseEntities(
      await sdk.currentUser.show(),
    )[0];
    const { email: userEmail } = User(currentUser).getAttributes();
    const { company: userCompany = {}, companyList = [] } =
      User(currentUser).getMetadata();
    const userId = User(currentUser).getId();

    const companyAccount = await fetchUser(companyId);
    const companyUser = User(companyAccount);
    const { companyName } = companyUser.getPublicData();
    const { members = {} } = companyUser.getMetadata();
    const userMember = members[userEmail];

    const { expireTime = 0, permission } = userMember;
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
    const newCompanyList = Array.from(new Set(companyList).add(companyId));
    await integrationSdk.users.updateProfile({
      id: userId,
      metadata: {
        companyList: newCompanyList,
        company: {
          ...userCompany,
          [companyId]: {
            permission: permission || UserPermission.PARTICIPANT,
          },
        },
      },
    });

    createFirebaseDocNotification(ENotificationType.COMPANY_JOINED, {
      userId,
      companyName,
    });

    return res.json({
      message: 'userAccept',
    });
  } catch (error) {
    handleError(res, error);
  }
}

export default cookies(handler);
