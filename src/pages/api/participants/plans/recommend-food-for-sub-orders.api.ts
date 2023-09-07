import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import cookies from '@services/cookie';
import { getIntegrationSdk } from '@services/integrationSdk';
import participantChecker from '@services/permissionChecker/participant';
import { handleError } from '@services/sdk';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const apiMethod = req.method;
    const integrationSdk = getIntegrationSdk();

    switch (apiMethod) {
      case HttpMethod.PUT:
        {
          const { mappedRecommendFoodToOrderDetail } = req.body;
          await Promise.all(
            Object.keys(mappedRecommendFoodToOrderDetail).map(
              async (planId: string) => {
                await integrationSdk.listings.update({
                  id: planId,
                  metadata: {
                    orderDetail:
                      mappedRecommendFoodToOrderDetail[planId].orderDetail,
                  },
                });
              },
            ),
          );

          res.status(200).json({ success: true });
        }
        break;
      default:
        break;
    }
  } catch (error) {
    console.error(error);
    handleError(res, error);
  }
}

export default cookies(participantChecker(handler));
