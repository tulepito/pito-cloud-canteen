import type { NextApiRequest, NextApiResponse } from 'next';

import cookies from '@services/cookie';
import { getIntegrationSdk, handleError } from '@services/sdk';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const { dataParams, queryParams = {} } = req.body;
    const integrationSdk = getIntegrationSdk();
    const response = await integrationSdk.users.updateProfile(
      dataParams,
      queryParams,
    );
    res.json(response);
  } catch (error) {
    handleError(res, error);
  }
}

export default cookies(handler);
