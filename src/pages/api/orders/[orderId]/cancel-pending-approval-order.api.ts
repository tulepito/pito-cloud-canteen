import { HttpMethod } from '@apis/configs';
import { getIntegrationSdk } from '@services/integrationSdk';
import { handleError } from '@services/sdk';
import { denormalisedResponseEntities, Listing } from '@utils/data';
import { EOrderDraftStates, EOrderStates } from '@utils/enums';
import type { NextApiRequest, NextApiResponse } from 'next';

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

          if (orderState !== EOrderDraftStates.pendingApproval) {
            throw new Error(
              'You can cancel pending approval order (with orderState is "pendingApproval") only',
            );
          }

          const [updatedOrderListing] = denormalisedResponseEntities(
            await integrationSdk.listings.update({
              id: orderId,
              metadata: {
                orderState: EOrderStates.canceledByBooker,
                orderStateHistory: orderStateHistory.concat({
                  state: EOrderStates.canceledByBooker,
                  updatedAt: new Date().getTime(),
                }),
              },
            }),
          );

          res.status(200).json({
            message: `Successfully cancel pending approval order, orderId: ${orderId}`,
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

export default handler;
