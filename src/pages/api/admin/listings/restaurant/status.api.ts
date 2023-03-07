import type { NextApiRequest, NextApiResponse } from 'next';

import cookies from '@services/cookie';
import adminChecker from '@services/permissionChecker/admin';
import { getIntegrationSdk, handleError } from '@services/sdk';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const { dataParams, queryParams = {} } = req.body;
    const { id, status } = dataParams;
    const integrationSdk = getIntegrationSdk();
    const response = await integrationSdk.listings.update(
      {
        id,
        metadata: {
          status,
        },
      },
      queryParams,
    );
    res.json(response);
  } catch (error) {
    console.error(error);
    handleError(res, error);
  }
}

export default cookies(adminChecker(handler));
