import type { NextApiRequest, NextApiResponse } from 'next';

import cookies from '@services/cookie';
import { getIntegrationSdk } from '@services/integrationSdk';
import { handleError } from '@services/sdk';
import { denormalisedResponseEntities } from '@src/utils/data';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const { resourceId } = req.query;
    const integrationSdk = getIntegrationSdk();
    const events = denormalisedResponseEntities(
      await integrationSdk.events.query({
        resourceId,
      }),
    );
    res.json(events);
  } catch (error) {
    handleError(res, error);
  }
}

export default cookies(handler);
