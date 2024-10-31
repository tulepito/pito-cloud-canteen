import isEmpty from 'lodash/isEmpty';
import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import logger from '@helpers/logger';
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

        logger.info('start-order.api', 'Start order');
        await startOrder(orderId as string, planId as string);

        logger.info('start-order.api', 'Initiate transaction');
        await initiateTransaction({
          orderId: orderId as string,
          planId: planId as string,
        });
        logger.info('start-order.api', 'Successfully initiate transaction');

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
    logger.error('start-order.api', String(error));
    handleError(res, error);
  }
}

export default handler;
