import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import { getIntegrationSdk } from '@services/integrationSdk';
import { handleError } from '@services/sdk';
import { EListingStates } from '@src/utils/enums';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const apiMethod = req.method;
    const integrationSdk = getIntegrationSdk();
    switch (apiMethod) {
      case HttpMethod.POST: {
        const { menuId } = req.query;
        const response = await integrationSdk.listings.update(
          {
            id: menuId,
            metadata: {
              listingState: EListingStates.closed,
            },
          },
          {
            expand: true,
          },
        );

        return res.status(200).json(response);
      }
      default: {
        return res.status(500).json({ message: 'Method is not allowed' });
      }
    }
  } catch (error) {
    console.error(error);
    handleError(res, error);
  }
}

export default handler;
