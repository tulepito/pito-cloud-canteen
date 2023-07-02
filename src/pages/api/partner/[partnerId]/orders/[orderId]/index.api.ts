import isEmpty from 'lodash/isEmpty';
import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import { EHttpStatusCode } from '@apis/errors';
import { denormalisedResponseEntities } from '@services/data';
import { getIntegrationSdk, handleError } from '@services/sdk';
import { Listing } from '@src/utils/data';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const { orderId, JSONParams } = req.query;
    const { date } = JSON.parse(JSONParams as string);

    const apiMethod = req.method;
    const integrationSdk = getIntegrationSdk();

    if (isEmpty(date) || isEmpty(orderId)) {
      return res
        .status(EHttpStatusCode.BadRequest)
        .json({ error: 'Missing order date or order ID' });
    }

    switch (apiMethod) {
      case HttpMethod.GET: {
        const [order] = denormalisedResponseEntities(
          (await integrationSdk.listings.show({ id: orderId })) || [{}],
        );
        const { plans = [] } = Listing(order).getMetadata();
        const planId = plans[0];
        let orderWithPlanDataMaybe = order;

        if (planId) {
          const [planListing] = denormalisedResponseEntities(
            (await integrationSdk.listings.show({ id: planId })) || [{}],
          );

          if (isEmpty(planListing)) {
            return res
              .status(EHttpStatusCode.NotFound)
              .json({ error: 'Order detail was not found' });
          }

          const { orderDetail = {} } = Listing(planListing).getMetadata();
          const orderDetailOfDate = orderDetail[date];
          const txId = orderDetailOfDate?.transactionId;

          if (isEmpty(txId)) {
            return res
              .status(EHttpStatusCode.BadRequest)
              .json({ error: 'Missing invalid order date' });
          }

          const [transaction] = denormalisedResponseEntities(
            (await integrationSdk.transactions.show({
              id: txId,
            })) || [{}],
          );

          orderWithPlanDataMaybe = { ...order, plan: planListing, transaction };
        }

        return res.status(200).json({ order: orderWithPlanDataMaybe });
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
