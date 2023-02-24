// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import cookies from '@services/cookie';
import adminChecker from '@services/permissionChecker/admin';
import { getIntegrationSdk, handleError } from '@services/sdk';
import type { NextApiRequest, NextApiResponse } from 'next';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const { dataParams, queryParams = {} } = req.body;
    const intergrationSdk = getIntegrationSdk();
    const response = await intergrationSdk.users.updateProfile(
      dataParams,
      queryParams,
    );
    res.json(response);
  } catch (error) {
    handleError(res, error);
  }
}

export default cookies(adminChecker(handler));
