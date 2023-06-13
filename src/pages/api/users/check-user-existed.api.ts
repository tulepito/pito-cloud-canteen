import isEmpty from 'lodash/isEmpty';
import type { NextApiRequest, NextApiResponse } from 'next';

import cookies from '@services/cookie';
import { getIntegrationSdk } from '@services/integrationSdk';
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
        ...(hasId ? { id } : {}),
        ...(hasEmail ? { email } : {}),
      }),
    );

    return res.json({ status: 200, user });
  } catch (error: any) {
    return res.json({ status: 404, message: 'User not found' });
  }
}

export default cookies(handler);
