import { HttpMethod } from '@apis/configs';
import { handleError } from '@services/sdk';
import isEmpty from 'lodash/isEmpty';
import type { NextApiRequest, NextApiResponse } from 'next';

import { cancelPickingOrder } from './cancel-picking-order.service';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const apiMethod = req.method;

    switch (apiMethod) {
      case HttpMethod.GET:
        break;
      case HttpMethod.POST:
        break;
      case HttpMethod.DELETE:
        break;
      case HttpMethod.PUT:
        {
          const { orderId } = req.query;

          if (isEmpty(orderId)) {
            res.status(400).json({ error: 'orderId is required' });
          }

          await cancelPickingOrder(orderId as string);

          res.json({
            message: `Successfully cancel order, order ID: ${orderId}`,
          });
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

export default handler;
