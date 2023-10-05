import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import { transitionOrderStatus } from '@pages/api/admin/plan/transition-order-status.service';
import { fetchListing, fetchUser } from '@services/integrationHelper';
import { getIntegrationSdk, handleError } from '@services/sdk';
import { Listing, User } from '@src/utils/data';
import { ETransition } from '@src/utils/transaction';

const fetchData = async (orderId: string) => {
  const order = await fetchListing(orderId);
  const orderListing = Listing(order);
  const { plans = [], companyId } = orderListing.getMetadata();
  const company = await fetchUser(companyId);
  const companyUser = User(company);
  const {
    companyLocation: { address: deliveryAddress },
  } = companyUser.getPublicData();

  const plan = await fetchListing(plans[0]);

  return {
    order,
    plan,
    deliveryAddress,
  };
};

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const apiMethod = req.method;
    const integrationSdk = getIntegrationSdk();

    switch (apiMethod) {
      case HttpMethod.POST: {
        const event = req.body;

        console.log('event', event);
        const { path } = event;
        switch (event.status) {
          case 'ASSIGNING': {
            await Promise.all(
              path.map(async (OWSubOrder: any) => {
                const { tracking_number: trackingNumber, address } = OWSubOrder;
                if (!trackingNumber) return;

                const [orderId, subOrderDate] = trackingNumber.split('_');
                const { plan, deliveryAddress } = await fetchData(orderId);

                if (address !== deliveryAddress) return;

                const planListing = Listing(plan);
                const planId = planListing.getId();
                const { orderDetail = {} } = planListing.getMetadata();
                const subOrder = orderDetail[subOrderDate];
                const { isOnWheelOrderCreated = false } = subOrder;
                if (!isOnWheelOrderCreated) {
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
                }
              }),
            );

            return res.status(200).end();
          }

          case 'IN PROCESS': {
            await Promise.all(
              path.map(async (OWSubOrder: any) => {
                const {
                  tracking_number: trackingNumber,
                  status,
                  address,
                } = OWSubOrder;
                if (!trackingNumber) return;

                const transition =
                  status === 'COMPLETED'
                    ? ETransition.COMPLETE_DELIVERY
                    : status === 'CANCELED'
                    ? ETransition.OPERATOR_CANCEL_PLAN
                    : ETransition.START_DELIVERY;

                const [orderId, subOrderDate] = trackingNumber.split('_');
                const { plan, deliveryAddress, order } = await fetchData(
                  orderId,
                );

                if (address !== deliveryAddress) return;

                const planListing = Listing(plan);
                const planId = planListing.getId();
                const { orderDetail = {} } = planListing.getMetadata();
                const subOrder = orderDetail[subOrderDate];
                const { transactionId, lastTransition } = subOrder || {};

                if (lastTransition === transition) return;

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
                if (
                  transition === ETransition.COMPLETE_DELIVERY ||
                  transition === ETransition.OPERATOR_CANCEL_PLAN
                ) {
                  await transitionOrderStatus(order, plan, integrationSdk);
                }
              }),
            );

            return res.status(200).end();
          }

          case 'CANCELED': {
            await Promise.all(
              path.map(async (OWSubOrder: any) => {
                const { tracking_number: trackingNumber, status } = OWSubOrder;
                if (!trackingNumber) return;

                if (status === 'CANCELED') {
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
                }
              }),
            );

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
