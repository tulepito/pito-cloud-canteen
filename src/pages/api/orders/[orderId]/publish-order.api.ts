import isEmpty from 'lodash/isEmpty';
import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import { handleError } from '@services/sdk';

import { publishOrder } from './publish-order.service';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const apiMethod = req.method;

    switch (apiMethod) {
      case HttpMethod.POST:
        {
          const { orderId } = req.query;

          if (isEmpty(orderId)) {
            res.status(400).json({ error: 'Missing orderId' });

            return;
          }

          await publishOrder(orderId as string);
          res.json({ message: `Successfully publish order ${orderId}` });
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
