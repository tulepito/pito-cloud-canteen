import type { NextApiRequest, NextApiResponse } from 'next';

import cookies from '@services/cookie';
import { getIntegrationSdk } from '@services/integrationSdk';
import { denormalisedResponseEntities } from '@utils/data';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const { JSONParams = '', groupId /* page, */ /* perPage */ } = req.query;

  const { memberIds = [] } = JSON.parse(JSONParams as string) || {};

  try {
    const integrationSdk = getIntegrationSdk();
    const allMembersResponse = await integrationSdk.users.query({
      meta_id: memberIds,
    });
    const {
      data: { meta },
    } = allMembersResponse;
    const allMembers = denormalisedResponseEntities(allMembersResponse);

    return res.json({ allMembers, meta });
  } catch (error) {
    console.error('Error query all group members, group ID: ', groupId);
  }
}

export default cookies(handler);
