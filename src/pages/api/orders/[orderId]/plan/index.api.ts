import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import logger from '@helpers/logger';
import cookies from '@services/cookie';
import { handleError } from '@services/sdk';

import createPlan from './create.service';
import updatePlan from './update.service';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const apiMethod = req.method;
  switch (apiMethod) {
    case HttpMethod.POST:
      try {
        const orderId = req.query.orderId as string;
        const { orderDetail } = req.body;

        const planListing = await createPlan({ orderId, orderDetail });

        return res.json(planListing);
      } catch (error) {
        logger.error('Error updating plan', String(error));
        handleError(res, error);
      }
      break;
    case HttpMethod.PUT:
      try {
        const orderId = req.query.orderId as string;
        const { planId, orderDetail, updateMode = 'replace' } = req.body;

        const planListing = await updatePlan({
          orderId,
          planId,
          orderDetail,
          updateMode,
        });

        return res.json(planListing);
      } catch (error) {
        logger.error('Error updating plan', String(error));
        handleError(res, error);
      }
      break;

    default:
      break;
  }
};
export default cookies(handler);
