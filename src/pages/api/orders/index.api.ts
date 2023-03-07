import type { NextApiRequest, NextApiResponse } from 'next';

import { composeApiCheckers } from '@apis/configs';
import orderChecker from '@services/permissionChecker/order';
import { handleError } from '@services/sdk';

import { HTTP_METHODS } from '../helpers/constants';

import createPlan from './[orderId]/plan/create.service';
import createOrder from './create.service';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const apiMethod = req.method;
  switch (apiMethod) {
    case HTTP_METHODS.POST:
      try {
        const { companyId, bookerId, isCreatedByAdmin, generalInfo } = req.body;

        const orderListing = await createOrder({
          companyId,
          bookerId,
          isCreatedByAdmin,
          generalInfo,
        });
        const planListing = await createPlan({
          orderId: orderListing?.id?.uuid,
          orderDetail: {},
        });
        orderListing.attributes.metadata.plans = [planListing.id.uuid];
        return res.json(orderListing);
      } catch (error) {
        handleError(res, error);
      }
      break;
    default:
      break;
  }
};

export default composeApiCheckers(orderChecker)(handler);
