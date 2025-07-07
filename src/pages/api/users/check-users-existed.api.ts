import type { NextApiRequest, NextApiResponse } from 'next';

import cookies from '@services/cookie';
import { getIntegrationSdk } from '@services/integrationSdk';
import { EImageVariants } from '@src/utils/enums';
import { denormalisedResponseEntities } from '@utils/data';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const { JSONParams } = req.query;
  const { emails } = JSON.parse(JSONParams as string);
  const integrationSdk = getIntegrationSdk();

  if (!emails || !Array.isArray(emails) || emails.length === 0) {
    return res.status(400).json({ message: 'Missing or invalid emails' });
  }

  try {
    const results = await Promise.allSettled(
      emails.map(async (email) => {
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

    return res
      .status(200)
      .json(
        results
          .filter(
            (r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled',
          )
          .map((r) => r.value),
      );
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export default cookies(handler);
