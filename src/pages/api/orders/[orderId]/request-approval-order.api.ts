/* eslint-disable no-console */
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import isEmpty from 'lodash/isEmpty';
import type { NextApiRequest, NextApiResponse } from 'next';

import { composeApiCheckers, HttpMethod } from '@apis/configs';
import { denormalisedResponseEntities } from '@services/data';
import { getIntegrationSdk } from '@services/integrationSdk';
import adminChecker from '@services/permissionChecker/admin';
import { handleError } from '@services/sdk';
import { Listing } from '@utils/data';
import { EOrderDraftStates } from '@utils/enums';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const apiMethod = req.method;
    const integrationSdk = getIntegrationSdk();

    switch (apiMethod) {
      case HttpMethod.PUT:
        {
          const orderId = req.query.orderId as string;
          const [orderListing] = denormalisedResponseEntities(
            await integrationSdk.listings.show({
              id: orderId,
            }),
          );
          const { orderState, orderStateHistory = [] } =
            Listing(orderListing).getMetadata();

          if (orderState !== EOrderDraftStates.draft) {
            throw new Error(
              'You can publish draft order (with orderState is "draft") only',
            );
          }

          const updatedAt = new Date().getTime();

          const initOrderStateHistory = isEmpty(orderStateHistory)
            ? [
                {
                  state: EOrderDraftStates.draft,
                  updatedAt,
                },
              ]
            : orderStateHistory;
          const updateOrderStateHistory = initOrderStateHistory.concat([
            {
              state: EOrderDraftStates.pendingApproval,
              updatedAt,
            },
          ]);

          const [updatedOrderListing] = denormalisedResponseEntities(
            await integrationSdk.listings.update(
              {
                id: orderId,
                metadata: {
                  orderState: EOrderDraftStates.pendingApproval,
                  orderStateHistory: updateOrderStateHistory,
                },
              },
              { expand: true },
            ),
          );

          res.status(200).json(updatedOrderListing);
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

export default composeApiCheckers(adminChecker)(handler);
