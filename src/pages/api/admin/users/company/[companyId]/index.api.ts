import cookies from '@services/cookie';
import adminChecker from '@services/permissionChecker/admin';
import { getIntegrationSdk, handleError } from '@services/sdk';
import type { NextApiRequest, NextApiResponse } from 'next';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const { companyId } = req.query;
    const integrationSdk = getIntegrationSdk();
    const response = await integrationSdk.users.show(
      {
        id: companyId,
      },
      { expand: true },
    );
    res.json(response);
  } catch (error) {
    handleError(res, error);
  }
}

export default cookies(adminChecker(handler));
