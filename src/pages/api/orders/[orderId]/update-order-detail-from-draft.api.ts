import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import { pushNotificationOrderDetailChanged } from '@pages/api/helpers/orderDetailHelper';
import { denormalisedResponseEntities } from '@services/data';
import { getIntegrationSdk, handleError } from '@services/sdk';
import { Listing } from '@src/utils/data';

import { normalizeOrderDetail } from '../utils';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const apiMethod = req.method;
  const integrationSdk = getIntegrationSdk();

  switch (apiMethod) {
    case HttpMethod.PUT:
      try {
        const { planId, orderDetail } = req.body;
        const { orderId } = req.query;

        const [oldPlanListing] = denormalisedResponseEntities(
          await integrationSdk.listings.show({
            id: planId,
          }),
        );
        const { orderDetail: oldOrderDetail } =
          Listing(oldPlanListing).getMetadata();
        const [planListing] = denormalisedResponseEntities(
          await integrationSdk.listings.update({
            id: planId,
            metadata: {
              orderDetail,
            },
          }),
        );

        const [orderListing] = denormalisedResponseEntities(
          await integrationSdk.listings.show({
            id: orderId,
          }),
        );

        const { deliveryHour } = Listing(orderListing).getMetadata();

        const normalizedOrderDetail = normalizeOrderDetail({
          orderId: orderId as string,
          planId,
          planOrderDetail: orderDetail,
          deliveryHour,
        });

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

        await pushNotificationOrderDetailChanged(
          orderDetail,
          oldOrderDetail,
          orderListing,
          integrationSdk,
        );

        res.json({
          statusCode: 200,
          message: `Successfully update plan from draft plan, planId: ${planId}`,
          planListing,
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
