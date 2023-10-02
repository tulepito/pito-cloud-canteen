import type { NextApiRequest, NextApiResponse } from 'next';

import cookies from '@services/cookie';
import partnerChecker from '@services/permissionChecker/partner';
import { getIntegrationSdk, handleError } from '@services/sdk';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const { ids = [], id } = req.body;
    const integrationSdk = getIntegrationSdk();

    let response;

    if (ids && ids.length > 0) {
      response = await Promise.all(
        ids.map(async (i: string) => {
          return integrationSdk.listings.update({
            id: i,
            metadata: {
              isDeleted: true,
            },
          });
        }),
      );
    } else {
      response = await integrationSdk.listings.update({
        id,
        metadata: {
          isDeleted: true,
        },
      });
    }

    res.json(response);
  } catch (error) {
    console.error(error);
    handleError(res, error);
  }
}

export default cookies(partnerChecker(handler));
