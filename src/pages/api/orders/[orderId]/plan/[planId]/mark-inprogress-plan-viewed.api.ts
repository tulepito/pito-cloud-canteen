import isEmpty from 'lodash/isEmpty';
import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import { handleError } from '@services/sdk';

import { markerPlanViewed } from './mark-inprogress-plan-viewed.service';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const apiMethod = req.method;

    switch (apiMethod) {
      case HttpMethod.PUT:
        {
          const { orderId, planId } = req.query;

          if (isEmpty(orderId) || isEmpty(planId)) {
            res.status(400).json({ error: 'Missing orderId or planId' });

            return;
          }

          await markerPlanViewed({
            orderId: orderId as string,
            planId: planId as string,
          });

          res.status(200).json({
            message: `Successfully mark order viewed`,
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
