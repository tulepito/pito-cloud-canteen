import type { NextApiRequest, NextApiResponse } from 'next';

import cookies from '@services/cookie';
import { getIntegrationSdk } from '@services/integrationSdk';
import { denormalisedResponseEntities } from '@utils/data';

const CHUNK_SIZE = 50; // Điều chỉnh tùy vào giới hạn API

function chunkArray<T>(array: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(array.length / size) }, (_, i) =>
    array.slice(i * size, i * size + size),
  );
}

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const { JSONParams = '', groupId /* page, */ /* perPage */ } = req.query;

  const { memberIds = [] } = JSON.parse(JSONParams as string) || {};

  try {
    const integrationSdk = getIntegrationSdk();
    const memberChunks = chunkArray(memberIds, CHUNK_SIZE);

    const responses = await Promise.all(
      memberChunks.map((chunk) =>
        integrationSdk.users.query({ meta_id: chunk }),
      ),
    );

    const allMembersRaw = responses.flatMap((response) =>
      denormalisedResponseEntities(response),
    );
    const meta = responses[0]?.data?.meta ?? {};

    return res.json({ allMembers: allMembersRaw, meta });
  } catch (error) {
    console.error('Error query all group members, group ID: ', groupId);
  }
}

export default cookies(handler);
