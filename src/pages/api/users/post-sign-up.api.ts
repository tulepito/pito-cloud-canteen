import isEmpty from 'lodash/isEmpty';
import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import cookies from '@services/cookie';
import { getIntegrationSdk } from '@services/integrationSdk';
import { getSdk, handleError } from '@services/sdk';
import { CurrentUser, denormalisedResponseEntities } from '@utils/data';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const apiMethod = req.method;
    const sdk = getSdk(req, res);
    const integrationSdk = getIntegrationSdk();

    switch (apiMethod) {
      case HttpMethod.PUT: {
        try {
          const currentUserRes = await sdk.currentUser.show();
          const [currentUser] = denormalisedResponseEntities(currentUserRes);

          if (currentUser !== null && !isEmpty(currentUser)) {
            const currentUserId = CurrentUser(currentUser).getId();
            await integrationSdk.users.updateProfile({
              id: currentUserId,
              metadata: {
                id: currentUserId,
              },
            });

            return res.status(200).json('Successfully update user id');
          }

          return res.status(400).json('Invalid token');
        } catch (error) {
          handleError(res, error);
        }
        break;
      }
      default:
        break;
    }
  } catch (error) {
    console.error('error: ', error);
  }
};
export default cookies(handler);
