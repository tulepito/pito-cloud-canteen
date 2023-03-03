import type { NextApiRequest, NextApiResponse } from 'next';

import cookies from '@services/cookie';
import { getIntegrationSdk, handleError } from '@services/sdk';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const { dataParams, queryParams = {} } = req.body;
    const integrationSdk = getIntegrationSdk();

    const { ids = [], id } = dataParams;

    let response;

    if (ids && ids.length > 0) {
      response = await Promise.all(
        ids.map(async (i: string) => {
          return integrationSdk.listings.update(
            {
              id: i,
              metadata: {
                isDeleted: true,
              },
            },
            queryParams,
          );
        }),
      );
    } else {
      response = await integrationSdk.listings.update(
        {
          id,
          metadata: {
            isDeleted: true,
          },
        },
        queryParams,
      );
    }

    res.json(response);
  } catch (error) {
    console.error(error);
    handleError(res, error);
  }
}

export default cookies(handler);
