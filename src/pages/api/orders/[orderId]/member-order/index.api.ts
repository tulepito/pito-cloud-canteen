import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import { getIntegrationSdk, handleError } from '@services/sdk';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const apiMethod = req.method;
  const integrationSdk = getIntegrationSdk();

  switch (apiMethod) {
    case HttpMethod.PUT:
      try {
        const { planId, orderDetail, orderId, anonymous } = req.body;

        await integrationSdk.listings.update({
          id: planId,
          metadata: {
            orderDetail,
          },
        });

        if (orderId) {
          await integrationSdk.listings.update({
            id: orderId,
            metadata: {
              anonymous,
            },
          });
        }

        res.json({
          statusCode: 200,
          message: `Successfully update plan info, planId: ${planId}`,
        });
      } catch (error) {
        handleError(res, error);
      }
      break;

    default:
      break;
  }
};

export default handler;
