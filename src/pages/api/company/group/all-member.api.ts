import type { NextApiRequest, NextApiResponse } from 'next';

import cookies from '@services/cookie';
import { getIntegrationSdk } from '@services/integrationSdk';
import { denormalisedResponseEntities } from '@utils/data';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const { groupId, page, perPage } = req.query;
  const integrationSdk = getIntegrationSdk();
  const allMembersResponse = await integrationSdk.users.query({
    meta_groupList: `has_all:${groupId}`,
    page,
    perPage,
  });
  const {
    data: { meta },
  } = allMembersResponse;
  const allMembers = denormalisedResponseEntities(allMembersResponse);
  res.json({ allMembers, meta });
}

export default cookies(handler);
