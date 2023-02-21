// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import cookies from '@services/cookie';
import { getIntegrationSdk } from '@services/sdk';
import type { NextApiRequest, NextApiResponse } from 'next';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const { dataParams, queryParams = {} } = req.body;

  const { id, status } = dataParams;
  const intergrationSdk = getIntegrationSdk();
  const response = await intergrationSdk.users.updateProfile(
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
