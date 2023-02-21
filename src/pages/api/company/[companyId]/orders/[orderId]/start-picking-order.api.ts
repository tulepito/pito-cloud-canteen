/* eslint-disable no-console */
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { composeApiCheckers, HttpMethod } from '@apis/configs';
import { denormalisedResponseEntities } from '@services/data';
import { getIntegrationSdk } from '@services/integrationSdk';
import companyChecker from '@services/permissionChecker/company';
import { handleError } from '@services/sdk';
import { Listing } from '@utils/data';
import { EOrderStates } from '@utils/enums';
import type { NextApiRequest, NextApiResponse } from 'next';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const apiMethod = req.method;
    const integrationSdk = getIntegrationSdk();

    switch (apiMethod) {
      case HttpMethod.GET:
        break;
      case HttpMethod.POST:
        break;
      case HttpMethod.DELETE:
        break;
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

          if (orderState !== EOrderStates.picking) {
            throw new Error(
              'You can start picking order (with orderState is "picking") only',
            );
          }

          const updateOrderStateHistory = orderStateHistory.concat([
            {
              state: EOrderStates.inProgress,
              updatedAt: new Date().getTime(),
            },
          ]);

          const [updatedOrderListing] = denormalisedResponseEntities(
            await integrationSdk.listings.update(
              {
                id: orderId,
                metadata: {
                  orderState: EOrderStates.inProgress,
                  orderStateHistory: updateOrderStateHistory,
                },
              },
              { expand: true },
            ),
          );

          res.status(200).json({
            order: updatedOrderListing,
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

export default composeApiCheckers(companyChecker)(handler);
