import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import cookies from '@services/cookie';
import { handleError } from '@services/sdk';

import getOrder from './get.service';
import updateOrder from './update.service';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const apiMethod = req.method;

  switch (apiMethod) {
    case HttpMethod.GET:
      try {
        const orderId = req.query.orderId as string;
        const data = await getOrder({ orderId });

        res.json({ statusCode: 200, ...data });
      } catch (error) {
        handleError(res, error);
      }
      break;
    case HttpMethod.PUT:
      try {
        // Get query and params
        const orderId = req.query.orderId as string;
        const { generalInfo } = req.body;

        // Update order and return values
        const updatedOrderListing = await updateOrder({
          orderId,
          generalInfo,
        });

        return res.json(updatedOrderListing);
      } catch (error) {
        // Return error
        console.error('update order error : ', error);
        handleError(res, error);
      }
      break;
    default:
      break;
  }
}

export default cookies(handler);
