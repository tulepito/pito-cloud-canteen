import type { NextApiRequest, NextApiResponse } from 'next';

import cookies from '@services/cookie';
import { getIntegrationSdk } from '@services/sdk';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const { dataParams, queryParams = {} } = req.body;

  const { id, status } = dataParams;
  const integrationSdk = getIntegrationSdk();
  const response = await integrationSdk.users.updateProfile(
    {
      id,
      metadata: {
        status,
      },
    },
    queryParams,
  );
  res.json(response);
}

export default cookies(handler);
