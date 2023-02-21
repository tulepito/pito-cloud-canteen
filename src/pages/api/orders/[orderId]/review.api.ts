import { HttpMethod } from '@apis/configs';
import { denormalisedResponseEntities } from '@services/data';
import { getIntegrationSdk } from '@services/integrationSdk';
import { handleError } from '@services/sdk';
import { Listing } from '@utils/data';
import { EOrderStates } from '@utils/enums';
import isEmpty from 'lodash/isEmpty';
import type { NextApiRequest, NextApiResponse } from 'next';

const ValidOrderStates = [EOrderStates.pendingPayment, EOrderStates.completed];

const isEnableToReviewOrder = (orderState: EOrderStates) => {
  return ValidOrderStates.includes(orderState);
};

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const apiMethod = req.method;

    switch (apiMethod) {
      case HttpMethod.GET:
        break;
      case HttpMethod.POST:
        {
          const { orderId } = req.query;
          const { rating, comment } = req.body;
          const integrationSdk = getIntegrationSdk();

          if (isEmpty(orderId)) {
            res.status(400).json({
              error: 'Missing orderId',
            });
            return;
          }

          const [orderListing] = denormalisedResponseEntities(
            await integrationSdk.listings.show({
              id: orderId,
            }),
          );

          const { orderState, orderStateHistory = [] } =
            Listing(orderListing).getMetadata();

          if (!isEnableToReviewOrder(orderState)) {
            res.status(400).json({
              error: `Cannot review order, order state: ${orderState}`,
            });
            return;
          }

          // If order state is pendingPayment, we need to update order state to completed and reviewed
          const updatedAt = new Date().getTime();
          const newOrderStateHistory = orderStateHistory.concat(
            orderState === EOrderStates.pendingPayment
              ? [
                  {
                    state: EOrderStates.completed,
                    updatedAt,
                  },
                  {
                    state: EOrderStates.reviewed,
                    updatedAt,
                  },
                ]
              : {
                  state: EOrderStates.reviewed,
                  updatedAt,
                },
          );

          await integrationSdk.listings.update({
            id: orderId,
            metadata: {
              orderState: EOrderStates.reviewed,
              orderStateHistory: newOrderStateHistory,
              review: {
                rating,
                comment,
              },
            },
          });

          res.status(400).json({
            error: `Cannot review order, order state: ${orderState}`,
          });
        }
        break;
      case HttpMethod.DELETE:
        break;
      case HttpMethod.PUT:
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
