import isEmpty from 'lodash/isEmpty';
import type { NextApiRequest, NextApiResponse } from 'next';

import cookies from '@services/cookie';
import { getIntegrationSdk } from '@services/integrationSdk';
import { denormalisedResponseEntities } from '@utils/data';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const { JSONParams } = req.query;
  const { id, email } = JSON.parse(JSONParams as string);
  console.debug(
    '💫 > file: check-user-existed.api.ts:11 > handler > email: ',
    email,
  );
  console.debug('💫 > file: check-user-existed.api.ts:11 > handler > id: ', id);
  const integrationSdk = getIntegrationSdk();

  const hasId = !isEmpty(id);
  console.debug(
    '💫 > file: check-user-existed.api.ts:16 > handler > hasId: ',
    hasId,
  );
  const hasEmail = !isEmpty(email);
  console.debug(
    '💫 > file: check-user-existed.api.ts:18 > handler > hasEmail: ',
    hasEmail,
  );

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
