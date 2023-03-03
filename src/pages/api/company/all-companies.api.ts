import type { NextApiRequest, NextApiResponse } from 'next';

import cookies from '@services/cookie';
import { getIntegrationSdk } from '@services/integrationSdk';
import { handleError } from '@services/sdk';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const integrationSdk = getIntegrationSdk();
  try {
    const allCompaniesResponse = await integrationSdk.users.query({
      meta_isCompany: true,
    });
    const { status, statusText, data } = allCompaniesResponse;
    res.status(status).setHeader('Content-Type', 'application/json').json({
      status,
      statusText,
      data,
    });
  } catch (error) {
    handleError(res, error);
  }
};

export default cookies(handler);
