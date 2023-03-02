import cookies from '@services/cookie';
import { getIntegrationSdk } from '@services/integrationSdk';
import { denormalisedResponseEntities } from '@utils/data';
import type { NextApiRequest, NextApiResponse } from 'next';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const { email } = req.query;
  const integrationSdk = getIntegrationSdk();
  try {
    const [user] = denormalisedResponseEntities(
      await integrationSdk.users.show({
        email,
      }),
    );
    res.json(user);
  } catch (error: any) {
    res.json({ statusCode: 404, status: 'User not found' });
  }
}

export default cookies(handler);
