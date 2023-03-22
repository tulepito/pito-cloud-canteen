import type { NextApiRequest, NextApiResponse } from 'next';

import cookies from '@services/cookie';
import adminChecker from '@services/permissionChecker/admin';
import { getIntegrationSdk, handleError } from '@services/sdk';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const { companyId } = req.query;
    const integrationSdk = getIntegrationSdk();
    const response = await integrationSdk.users.show(
      {
        id: companyId,
        include: ['profileImage'],
      },
      { expand: true },
    );
    res.json(response);
  } catch (error) {
    handleError(res, error);
  }
}

export default cookies(adminChecker(handler));
