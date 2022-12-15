import cookies from '@services/cookie';
import { getIntegrationSdk } from '@services/sdk';
import type { NextApiRequest, NextApiResponse } from 'next';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const { groupId } = req.query;
  const integrationSdk = getIntegrationSdk();
  const allMembersResponse = await integrationSdk.users.query({
    meta_groupList: `has_all:${groupId}`,
  });
  const { status, statusText, data } = allMembersResponse;
  res.status(status).setHeader('Content-Type', 'application/json').json({
    status,
    statusText,
    data,
  });
}

export default cookies(handler);
