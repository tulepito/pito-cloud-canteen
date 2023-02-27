import cookies from '@services/cookie';
import { getIntegrationSdk, handleError } from '@services/sdk';
import type { NextApiRequest, NextApiResponse } from 'next';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const { dataParams = {}, queryParams = {} } = req.body;
    const { foodId } = req.query;
    const integrationSdk = getIntegrationSdk();
    const response = await integrationSdk.listings.show(
      { id: foodId, ...dataParams },
      queryParams,
    );
    res.json(response);
  } catch (error) {
    console.error(error);
    handleError(res, error);
  }
}

export default cookies(handler);
