import { HttpMethod } from '@apis/configs';
import { getIntegrationSdk, handleError } from '@services/sdk';
import type { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const apiMethod = req.method;
  const integrationSdk = getIntegrationSdk();
  switch (apiMethod) {
    case HttpMethod.GET:
      break;
    case HttpMethod.POST:
      break;
    case HttpMethod.PUT:
      try {
        const { planId, orderDetail } = req.body;

        await integrationSdk.listings.update({
          id: planId,
          metadata: {
            orderDetail,
          },
        });

        res.json({
          statusCode: 200,
          message: `Successfully update plan info, planId: ${planId}`,
        });
      } catch (error) {
        handleError(res, error);
      }
      break;
    case HttpMethod.DELETE:
      break;

    default:
      break;
  }
};
export default handler;
