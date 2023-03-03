import type { NextApiRequest, NextApiResponse } from 'next';

import cookies from '@services/cookie';
import { getIntegrationSdk, handleError } from '@services/sdk';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const { restaurantId } = req.query;
    const { dataParams, queryParams = {} } = req.body;

    const integrationSdk = getIntegrationSdk();
    const response = await integrationSdk.listings.show(
      {
        id: restaurantId,
        ...dataParams,
      },
      queryParams,
    );
    res.json(response);
  } catch (error) {
    handleError(res, error);
  }
}

export default cookies(handler);
