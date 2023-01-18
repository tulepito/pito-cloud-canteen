import cookies from '@services/cookie';
import { getIntegrationSdk } from '@services/sdk';
import type { NextApiRequest, NextApiResponse } from 'next';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const integrationSdk = getIntegrationSdk();

  const apiMethod = req.method;
  switch (apiMethod) {
    case 'GET':
      break;
    case 'POST':
      {
        const {
          query: { orderId = '' },
          body: {
            planId = '',
            participantId = '',
            participants = [],
            newOrderDetail = {},
          },
        } = req;

        await integrationSdk.listings.update({
          id: orderId,
          metadata: {
            participants,
          },
        });
        await integrationSdk.listings.update({
          id: planId,
          metadata: {
            participants,
            orderDetail: newOrderDetail,
          },
        });

        res.json({
          statusCode: 200,
          message: `Successfully delete participant, participantId: ${participantId}`,
        });
      }
      break;
    case 'PUT':
      break;
    case 'DELETE':
      break;
    default:
      break;
  }
}

export default cookies(handler);
