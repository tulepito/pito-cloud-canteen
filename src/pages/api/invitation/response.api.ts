import isEmpty from 'lodash/isEmpty';
import type { NextApiRequest, NextApiResponse } from 'next';

import cookies from '@services/cookie';
import { fetchUser } from '@services/integrationHelper';
import { getIntegrationSdk } from '@services/integrationSdk';
import { getSdk, handleError } from '@services/sdk';
import { UserPermission } from '@src/types/UserPermission';
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
    const companyAccountGetter = User(companyAccount);
    const { members = {} } = companyAccountGetter.getMetadata();
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

    return res.json({
      message: 'userAccept',
    });
  } catch (error) {
    handleError(res, error);
  }
}

export default cookies(handler);
