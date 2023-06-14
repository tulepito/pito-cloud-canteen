import isEmpty from 'lodash/isEmpty';
import type { NextApiRequest, NextApiResponse } from 'next';

import cookies from '@services/cookie';
import { fetchUser } from '@services/integrationHelper';
import { getIntegrationSdk } from '@services/integrationSdk';
import { createFirebaseDocNotification } from '@services/notifications';
import { getSdk, handleError } from '@services/sdk';
import { UserPermission } from '@src/types/UserPermission';
import { ENotificationType } from '@src/utils/enums';
import { denormalisedResponseEntities, User } from '@utils/data';

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

    const companyAccount = await fetchUser(companyId);
    const companyUser = User(companyAccount);
    const { companyName } = companyUser.getPublicData();
    const { members = {} } = companyUser.getMetadata();
    const userMember = members[userEmail];

    if (isEmpty(userMember)) {
      return res.json({
        message: 'invalidInvitaion',
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
              permission: UserPermission.PARTICIPANT,
            },
          },
        },
      });
    }

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
