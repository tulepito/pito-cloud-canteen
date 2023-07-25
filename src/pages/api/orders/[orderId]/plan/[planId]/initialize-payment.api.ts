import isEmpty from 'lodash/isEmpty';
import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import { fetchListing } from '@services/integrationHelper';
import { handleError } from '@services/sdk';

import { initializePayment } from './initialize-payment.service';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const apiMethod = req.method;

    switch (apiMethod) {
      case HttpMethod.POST:
        {
          const { orderId, planId } = req.query;

          if (isEmpty(orderId) || isEmpty(planId)) {
            res.status(400).json({ error: 'Missing orderId or planId' });

            return;
          }

          const orderListing = await fetchListing(orderId as string);
          const planListing = await fetchListing(planId as string);
          await initializePayment(orderListing, planListing);

          res.status(200).json({
            message: `Successfully initiate payment for order ${orderId} and plan ${planId}`,
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
