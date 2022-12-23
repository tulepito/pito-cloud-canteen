import cookies from '@services/cookie';
import { getIntegrationSdk } from '@services/integrationSdk';
import type { NextApiRequest, NextApiResponse } from 'next';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const { companyId } = req.query;
  const integrationSdk = getIntegrationSdk();
  const allMembersResponse = await integrationSdk.users.query({
    meta_companyList: `has_all:${companyId}`,
  });
  const { status, statusText, data } = allMembersResponse;
  res.status(status).setHeader('Content-Type', 'application/json').json({
    status,
    statusText,
    data,
  });
}

export default cookies(handler);
