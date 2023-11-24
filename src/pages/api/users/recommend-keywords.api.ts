import isEmpty from 'lodash/isEmpty';
import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import cookies from '@services/cookie';
import { getIntegrationSdk } from '@services/integrationSdk';
import { getSdk, handleError } from '@services/sdk';
import popularKeywords from '@src/assets/popularKeywords';
import { CurrentUser, denormalisedResponseEntities } from '@utils/data';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const apiMethod = req.method;
    const sdk = getSdk(req, res);
    const integrationSdk = getIntegrationSdk();
    switch (apiMethod) {
      case HttpMethod.GET: {
        try {
          const currentUserRes = await sdk.currentUser.show();
          const [currentUser] = denormalisedResponseEntities(currentUserRes);

          if (currentUser !== null && !isEmpty(currentUser)) {
            const { previousKeywords = [] } =
              CurrentUser(currentUser).getMetadata();

            return res.status(200).json({
              previousKeywords: previousKeywords.slice(0, 4),
              popularKeywords,
            });
          }

          return res.status(400).json('Invalid token');
        } catch (error) {
          handleError(res, error);
        }
        break;
      }
      case HttpMethod.DELETE: {
        try {
          const { keywords } = req.body;
          if (!keywords) {
            return res.status(400).json('The keywords is not empty');
          }
          const currentUserRes = await sdk.currentUser.show();
          const [currentUser] = denormalisedResponseEntities(currentUserRes);

          if (currentUser !== null && !isEmpty(currentUser)) {
            const currentUserId = CurrentUser(currentUser).getId();
            const previousKeywords: string[] =
              CurrentUser(currentUser).getMetadata()?.previousKeywords;
            await integrationSdk.users.updateProfile({
              id: currentUserId,
              metadata: {
                previousKeywords: previousKeywords.filter(
                  (k) => k !== keywords,
                ),
              },
            });

            return res
              .status(200)
              .json('Successfully delete keywords by user id');
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
