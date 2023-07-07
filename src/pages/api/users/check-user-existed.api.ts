import isEmpty from 'lodash/isEmpty';
import type { NextApiRequest, NextApiResponse } from 'next';

import cookies from '@services/cookie';
import { getIntegrationSdk } from '@services/integrationSdk';
import { EImageVariants } from '@src/utils/enums';
import { denormalisedResponseEntities } from '@utils/data';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const { JSONParams } = req.query;
  const { id, email } = JSON.parse(JSONParams as string);
  const integrationSdk = getIntegrationSdk();

  const hasId = !isEmpty(id);
  const hasEmail = !isEmpty(email);
  if (!hasId && !hasEmail) {
    return res.json({ status: 400, message: 'Missing id and email' });
  }

  try {
    const [user] = denormalisedResponseEntities(
      await integrationSdk.users.show({
        ...(hasId ? { id } : hasEmail ? { email } : {}),
        include: ['profileImage'],
        'fields.image': [
          `variants.${EImageVariants.squareSmall}`,
          `variants.${EImageVariants.squareSmall2x}`,
        ],
      }),
    );

    return res.json({ status: 200, user });
  } catch (error: any) {
    return res.json({ status: 404, message: 'User not found' });
  }
}

export default cookies(handler);
