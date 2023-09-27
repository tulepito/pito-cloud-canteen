import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import { fetchListing } from '@services/integrationHelper';
import { getIntegrationSdk, handleError } from '@services/sdk';
import { Listing } from '@src/utils/data';
import { ETransition } from '@src/utils/transaction';

const fetchData = async (orderId: string) => {
  const order = await fetchListing(orderId);
  const orderListing = Listing(order);
  const { plans = [] } = orderListing.getMetadata();

  const plan = await fetchListing(plans[0]);

  return {
    order,
    plan,
  };
};

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const apiMethod = req.method;
    const integrationSdk = getIntegrationSdk();

    switch (apiMethod) {
      case HttpMethod.POST: {
        const { event } = req.body;

        console.log('event', event);

        switch (event.status) {
          case 'ASSIGNING': {
            const { orderId, subOrderDate } = event;
            const { plan } = await fetchData(orderId);
            const planListing = Listing(plan);
            const planId = planListing.getId();
            const { orderDetail = {} } = planListing.getMetadata();
            const subOrder = orderDetail[subOrderDate];
            const newOrderDetail = {
              ...orderDetail,
              [subOrderDate]: {
                ...subOrder,
                isOnWheelOrderCreated: true,
              },
            };

            await integrationSdk.listings.update({
              id: planId,
              metadata: {
                orderDetail: newOrderDetail,
              },
            });

            return res.status(200).end();
          }

          case 'IN PROGRESS': {
            const { tracking_number: trackingNumber } = event;
            const [orderId, subOrderDate] = trackingNumber.split('_');
            const { plan } = await fetchData(orderId);
            const planListing = Listing(plan);
            const planId = planListing.getId();
            const { orderDetail = {} } = planListing.getMetadata();
            const subOrder = orderDetail[subOrderDate];
            const { transactionId } = subOrder || {};

            await integrationSdk.transactions.transition({
              id: transactionId,
              transition: ETransition.START_DELIVERY,
              params: {},
            });

            const newOrderDetail = {
              ...orderDetail,
              [subOrderDate]: {
                ...subOrder,
                lastTransition: ETransition.START_DELIVERY,
              },
            };

            await integrationSdk.listings.update({
              id: planId,
              metadata: {
                orderDetail: newOrderDetail,
              },
            });

            return res.status(200).end();
          }

          case 'COMPLETED': {
            const { tracking_number: trackingNumber, path } = event;
            const isAllPathCompleted = path.every(
              (pathItem: any) => pathItem.status === 'COMPLETED',
            );

            const [orderId, subOrderDate] = trackingNumber.split('_');
            const { plan } = await fetchData(orderId);
            const planListing = Listing(plan);
            const planId = planListing.getId();
            const { orderDetail = {} } = planListing.getMetadata();
            const subOrder = orderDetail[subOrderDate];
            const { transactionId } = subOrder || {};
            let transition;

            if (isAllPathCompleted) {
              transition = ETransition.COMPLETE_DELIVERY;
            } else {
              transition = ETransition.CANCEL_DELIVERY;
            }

            await integrationSdk.transactions.transition({
              id: transactionId,
              transition,
              params: {},
            });

            const newOrderDetail = {
              ...orderDetail,
              [subOrderDate]: {
                ...subOrder,
                lastTransition: transition,
              },
            };

            await integrationSdk.listings.update({
              id: planId,
              metadata: {
                orderDetail: newOrderDetail,
              },
            });

            return res.status(200).end();
          }

          case 'CANCELED': {
            const { tracking_number: trackingNumber } = event;
            const [orderId, subOrderDate] = trackingNumber.split('_');
            const { plan } = await fetchData(orderId);
            const planListing = Listing(plan);
            const planId = planListing.getId();
            const { orderDetail = {} } = planListing.getMetadata();
            const subOrder = orderDetail[subOrderDate];
            const { transactionId } = subOrder || {};

            await integrationSdk.transactions.transition({
              id: transactionId,
              transition: ETransition.CANCEL_DELIVERY,
              params: {},
            });

            const newOrderDetail = {
              ...orderDetail,
              [subOrderDate]: {
                ...subOrder,
                lastTransition: ETransition.CANCEL_DELIVERY,
              },
            };

            await integrationSdk.listings.update({
              id: planId,
              metadata: {
                orderDetail: newOrderDetail,
              },
            });

            return res.status(200).end();
          }

          default:
            break;
        }

        return res.status(404).end();
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
