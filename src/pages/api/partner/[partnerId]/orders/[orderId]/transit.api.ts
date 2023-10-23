import type { NextApiRequest, NextApiResponse } from 'next';

import { composeApiCheckers, HttpMethod } from '@apis/configs';
import { fetchListing } from '@services/integrationHelper';
import { getIntegrationSdk } from '@services/integrationSdk';
import partnerChecker from '@services/permissionChecker/partner';
import { handleError } from '@services/sdk';
import { denormalisedResponseEntities, Listing } from '@src/utils/data';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const {
      query: { orderId },
      body: { subOrderDate, transactionId, newTransition },
      method: apiMethod,
    } = req;
    const integrationSdk = getIntegrationSdk();

    switch (apiMethod) {
      case HttpMethod.PUT: {
        // TODO: transit transaction
        const txResponse = await integrationSdk.transactions.transition(
          {
            id: transactionId,
            transition: newTransition,
            params: {},
          },
          { expand: true, include: ['booking', 'listing', 'provider'] },
        );
        const transaction = denormalisedResponseEntities(txResponse)[0];

        // TODO: save lastTransition in orderDetail
        const order = await fetchListing(orderId as string);
        const { plans = [] } = Listing(order).getMetadata();
        const planId = plans[0];
        const plan = await fetchListing(planId);
        const { orderDetail = {} } = Listing(plan).getMetadata();

        const updateOrderDetail = {
          ...orderDetail,
          [subOrderDate]: {
            ...orderDetail[subOrderDate],
            lastTransition: newTransition,
          },
        };

        const [updatePlanListing] = denormalisedResponseEntities(
          await integrationSdk.listings.update(
            {
              id: planId,
              metadata: {
                orderDetail: updateOrderDetail,
              },
            },
            { expand: true },
          ),
        );

        return res.json({ transaction, plan: updatePlanListing });
      }
      default:
        break;
    }
  } catch (error) {
    console.error(error);
    handleError(res, error);
  }
}

export default composeApiCheckers(partnerChecker)(handler);
