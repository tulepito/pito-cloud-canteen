import { HTTP_METHODS } from '@pages/api/helpers/constants';
import cookies from '@services/cookie';
import { handleError } from '@services/sdk';
import type { NextApiRequest, NextApiResponse } from 'next';

import getOrder from './get.service';
import updateOrder from './update.service';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const apiMethod = req.method;
  switch (apiMethod) {
    case HTTP_METHODS.GET:
      try {
        const orderId = req.query.orderId as string;
        const data = await getOrder({ orderId });

        res.json({ statusCode: 200, ...data });
      } catch (error) {
        handleError(res, error);
      }
      break;
    case HTTP_METHODS.PUT:
      try {
        // Get query and params
        const orderId = req.query.orderId as string;
        const { generalInfo } = req.body;

        // Update order and return values
        const updatedOrderListing = await updateOrder({ orderId, generalInfo });
        return res.json(updatedOrderListing);
      } catch (error) {
        // Return error
        console.log('update order error : ', error);
        handleError(res, error);
      }
      break;
    default:
      break;
  }
}

export default cookies(handler);
