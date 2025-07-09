import type { NextApiRequest, NextApiResponse } from 'next';

import cookies from '@services/cookie';
import { getIntegrationSdk } from '@services/integrationSdk';
import { EImageVariants } from '@src/utils/enums';
import { denormalisedResponseEntities } from '@utils/data';

const BATCH_SIZE = 50;

function chunkArray<T>(array: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(array.length / size) }, (_, i) =>
    array.slice(i * size, i * size + size),
  );
}

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const { JSONParams } = req.query;
  const { emails } = JSON.parse(JSONParams as string);

  if (!emails || !Array.isArray(emails) || emails.length === 0) {
    return res.status(400).json({ message: 'Missing or invalid emails' });
  }

  const integrationSdk = getIntegrationSdk();
  const emailChunks = chunkArray(emails, BATCH_SIZE);

  try {
    const results: any[] = [];

    await emailChunks.reduce(async (previousPromise, chunk) => {
      await previousPromise;

      const chunkResults = await Promise.allSettled(
        chunk.map(async (email) => {
          try {
            const [user] = denormalisedResponseEntities(
              await integrationSdk.users.show({
                email,
                include: ['profileImage'],
                'fields.image': [
                  `variants.${EImageVariants.squareSmall}`,
                  `variants.${EImageVariants.squareSmall2x}`,
                ],
              }),
            );

            return { email, status: 200, user };
          } catch {
            return { email, status: 404, message: 'User not found' };
          }
        }),
      );

      results.push(
        ...chunkResults
          .filter(
            (r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled',
          )
          .map((r) => r.value),
      );
    }, Promise.resolve());

    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export default cookies(handler);
