import { HTTP_METHODS } from '@pages/api/helpers/constants';
import { handleError } from '@services/sdk';
import type { NextApiRequest, NextApiResponse } from 'next';

import createPlan from './create.service';
import updatePlan from './update.service';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const apiMethod = req.method;
  switch (apiMethod) {
    case HTTP_METHODS.POST:
      try {
        const orderId = req.query.orderId as string;
        const { orderDetail } = req.body;

        const planListing = await createPlan({ orderId, orderDetail });

        return res.json(planListing);
      } catch (error) {
        handleError(res, error);
      }
      break;
    case HTTP_METHODS.PUT:
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
        handleError(res, error);
      }
      break;

    default:
      break;
  }
};
export default handler;
