// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';

import cookies from '@services/cookie';
import adminChecker from '@services/permissionChecker/admin';
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

export default cookies(adminChecker(handler));
