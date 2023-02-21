import { HttpMethod } from '@apis/configs';
import { handleError } from '@services/sdk';
import isEmpty from 'lodash/isEmpty';
import type { NextApiRequest, NextApiResponse } from 'next';

import { startOrder } from '../../start-order.service';
import { initiateTransaction } from './initiate-transaction.service';

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
          const { orderId, planId } = req.body;

          if (isEmpty(orderId) || isEmpty(planId)) {
            res.status(400).json({ error: 'Missing orderId or planId' });
            return;
          }

          await startOrder(orderId);
          await initiateTransaction({ orderId, planId });

          res.status(200).json({
            message: `Successfully finish picking order`,
            orderId,
            planId,
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
