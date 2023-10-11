import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import cookies from '@services/cookie';
import { getIntegrationSdk } from '@services/integrationSdk';
import { handleError } from '@services/sdk';
import { denormalisedResponseEntities } from '@src/utils/data';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const apiMethod = req.method;
    const integrationSdk = getIntegrationSdk();

    switch (apiMethod) {
      case HttpMethod.PUT:
        {
          const { foodId } = req.query;
          const {
            dataParams: { action },
          } = req.body;
          const response = denormalisedResponseEntities(
            await integrationSdk.listings.update(
              {
                id: foodId as string,
                metadata: {
                  isFoodEnable: action === 'enable',
                },
              },
              {
                expand: true,
              },
            ),
          )[0];

          res.json(response);
        }
        break;
      default:
        break;
    }
  } catch (error) {
    console.error(error);
    handleError(res, error);
  }
}

export default cookies(handler);
