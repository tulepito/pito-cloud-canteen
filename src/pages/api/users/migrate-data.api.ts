import mapLimit from 'async/mapLimit';
import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import { EHttpStatusCode } from '@apis/errors';
import { getIntegrationSdk } from '@services/integrationSdk';
import { handleError } from '@services/sdk';
import type { TUser } from '@src/utils/types';
import { User } from '@utils/data';

const CHUNK_SIZE = 10;

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const apiMethod = req.method;

    const integrationSdk = getIntegrationSdk();

    switch (apiMethod) {
      case HttpMethod.GET: {
        try {
          const users: TUser[] = [];
          // Unlock here when on production site
          // const users =  await queryAllPages({
          //   sdkModel: integrationSdk.users,
          //   query: {},
          // });

          const updateFn = async (user: TUser) => {
            const userId = User(user).getId();
            await integrationSdk.users.updateProfile({
              id: userId,
              metadata: {
                id: userId,
              },
            });
          };

          const updatedTimes = 1;
          const updateRange = 100;
          const updateUsers = users.slice(
            updateRange * (updatedTimes - 1),
            updateRange * updatedTimes,
          );
          await mapLimit(updateUsers, CHUNK_SIZE, updateFn);

          // Unlock code below when on production site
          return res.status(EHttpStatusCode.Ok).json({
            // updatedTimes,
            // usersLeft: users.length - updateRange * (updatedTimes - 1),
            updateUsers,
          });
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
export default handler;
