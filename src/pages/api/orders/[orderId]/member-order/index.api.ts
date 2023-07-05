import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import { denormalisedResponseEntities } from '@services/data';
import { getIntegrationSdk, handleError } from '@services/sdk';
import { Listing } from '@src/utils/data';

import { normalizeOrderDetail } from '../../utils';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const apiMethod = req.method;
  const integrationSdk = getIntegrationSdk();

  switch (apiMethod) {
    case HttpMethod.PUT:
      try {
        const { planId, orderDetail, anonymous } = req.body;

        const response = await integrationSdk.listings.update(
          {
            id: planId,
            metadata: {
              orderDetail,
            },
          },
          { expand: true },
        );

        const [planListing] = denormalisedResponseEntities(response);

        const { orderId } = Listing(planListing).getMetadata();

        const orderResponse = await integrationSdk.listings.show(
          {
            id: orderId,
          },
          { expand: true },
        );

        const [orderListing] = denormalisedResponseEntities(orderResponse);

        const { deliveryHour } = Listing(orderListing).getMetadata();

        const normalizedOrderDetail = normalizeOrderDetail({
          orderId,
          planId,
          planOrderDetail: orderDetail,
          deliveryHour,
        });

        if (orderId) {
          await integrationSdk.listings.update({
            id: orderId,
            metadata: {
              anonymous,
            },
          });
        }

        await Promise.all(
          normalizedOrderDetail.map(async (order, index) => {
            const { params } = order;
            const {
              transactionId,
              extendedData: { metadata },
            } = params;

            if (transactionId) {
              await integrationSdk.transactions.updateMetadata({
                id: transactionId,
                metadata: {
                  ...metadata,
                  isLastTxOfPlan: index === normalizedOrderDetail.length - 1,
                },
              });
            }
          }),
        );

        res.json({
          statusCode: 200,
          message: `Successfully update plan info, planId: ${planId}`,
        });
      } catch (error) {
        handleError(res, error);
      }
      break;

    default:
      break;
  }
};

export default handler;
