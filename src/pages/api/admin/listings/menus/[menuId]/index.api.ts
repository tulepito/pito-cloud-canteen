import type { NextApiRequest, NextApiResponse } from 'next';

import cookies from '@services/cookie';
import { getIntegrationSdk, handleError } from '@services/sdk';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const { dataParams = {}, queryParams = {} } = req.body;
    const { menuId } = req.query;
    const integrationSdk = getIntegrationSdk();
    const response = await integrationSdk.listings.show(
      { id: menuId, ...dataParams },
      queryParams,
    );
    res.json(response);
  } catch (error) {
    console.log(error);
    handleError(res, error);
  }
}

export default cookies(handler);
