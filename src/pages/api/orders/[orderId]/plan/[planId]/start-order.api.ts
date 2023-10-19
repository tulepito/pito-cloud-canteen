import isEmpty from 'lodash/isEmpty';
import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import { handleError } from '@services/sdk';

import { startOrder } from '../../start-order.service';

import { initiateTransaction } from './initiate-transaction.service';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const apiMethod = req.method;

    switch (apiMethod) {
      case HttpMethod.PUT: {
        const { orderId, planId } = req.query;

        if (isEmpty(orderId) || isEmpty(planId)) {
          return res.status(400).json({ error: 'Missing orderId or planId' });
        }

        await startOrder(orderId as string, planId as string);
        console.info('>> Started order: ', orderId);

        await initiateTransaction({
          orderId: orderId as string,
          planId: planId as string,
        });
        console.info('>> Initiated transactions');

        return res.status(200).json({
          message: `Successfully finish picking order`,
          orderId,
          planId,
        });
      }

      default:
        break;
    }
  } catch (error) {
    console.error(error);
    handleError(res, error);
  }
}

export default handler;
