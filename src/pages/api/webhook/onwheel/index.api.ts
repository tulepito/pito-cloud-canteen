import omit from 'lodash/omit';
import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import { transitionOrderStatus } from '@pages/api/admin/plan/transition-order-status.service';
import createQuotation from '@pages/api/orders/[orderId]/quotation/create-quotation.service';
import { emailSendingFactory, EmailTemplateTypes } from '@services/email';
import { fetchListing, fetchUser } from '@services/integrationHelper';
import { createFirebaseDocNotification } from '@services/notifications';
import { getIntegrationSdk, handleError } from '@services/sdk';
import { Listing, User } from '@src/utils/data';
import {
  ENotificationType,
  EOnWheelOrderStatus,
  EQuotationStatus,
} from '@src/utils/enums';
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
          case EOnWheelOrderStatus.assigning: {
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

          case EOnWheelOrderStatus.inProcess: {
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
                    ? ETransition.CANCEL_DELIVERY
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
                const { transactionId, lastTransition, restaurant } =
                  subOrder || {};

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

                const orderListing = Listing(order);
                const { title: orderTitle } = orderListing.getAttributes();
                const {
                  participantIds = [],
                  anonymous = [],
                  quotationId,
                  companyId,
                } = orderListing.getMetadata();
                const generalNotificationData = {
                  orderId,
                  orderTitle,
                  planId,
                  subOrderDate,
                };
                if (transition === ETransition.START_DELIVERY) {
                  [participantIds, anonymous].map(
                    async (participantId: string) => {
                      createFirebaseDocNotification(
                        ENotificationType.ORDER_DELIVERING,
                        {
                          ...generalNotificationData,
                          userId: participantId,
                        },
                      );
                    },
                  );
                }
                if (transition === ETransition.COMPLETE_DELIVERY) {
                  [participantIds, anonymous].map(
                    async (participantId: string) => {
                      createFirebaseDocNotification(
                        ENotificationType.ORDER_SUCCESS,
                        {
                          ...generalNotificationData,
                          userId: participantId,
                        },
                      );
                    },
                  );
                  await transitionOrderStatus(order, plan, integrationSdk);
                }
                if (transition === ETransition.CANCEL_DELIVERY) {
                  emailSendingFactory(
                    EmailTemplateTypes.BOOKER.BOOKER_SUB_ORDER_CANCELED,
                    {
                      orderId,
                      timestamp: subOrderDate,
                    },
                  );

                  participantIds.forEach((participantId: string) => {
                    emailSendingFactory(
                      EmailTemplateTypes.PARTICIPANT
                        .PARTICIPANT_SUB_ORDER_CANCELED,
                      {
                        orderId,
                        timestamp: subOrderDate,
                        participantId,
                      },
                    );
                  });

                  if (
                    process.env.NEXT_APP_ALLOW_PARTNER_EMAIL_SEND === 'true'
                  ) {
                    emailSendingFactory(
                      EmailTemplateTypes.PARTNER.PARTNER_SUB_ORDER_CANCELED,
                      {
                        orderId,
                        timestamp: subOrderDate,
                        restaurantId: restaurant.id,
                      },
                    );
                  }

                  participantIds.map(async (participantId: string) => {
                    createFirebaseDocNotification(
                      ENotificationType.ORDER_CANCEL,
                      {
                        ...generalNotificationData,
                        userId: participantId,
                      },
                    );
                  });

                  const quotation = await fetchListing(quotationId);
                  const quotationListing = Listing(quotation);
                  const { client, partner } = quotationListing.getMetadata();
                  const newClient = {
                    ...client,
                    quotation: omit(client.quotation, [subOrderDate]),
                  };

                  const newPartner = {
                    ...partner,
                    [restaurant.id]: {
                      ...partner[restaurant.id],
                      quotation: omit(partner[restaurant.id].quotation, [
                        subOrderDate,
                      ]),
                    },
                  };
                  integrationSdk.listings.update({
                    id: quotationId,
                    metadata: {
                      status: EQuotationStatus.INACTIVE,
                    },
                  });
                  createQuotation({
                    orderId,
                    companyId,
                    client: newClient,
                    partner: newPartner,
                  });
                  await transitionOrderStatus(order, plan, integrationSdk);
                }
              }),
            );

            return res.status(200).end();
          }

          // case EOnWheelOrderStatus.cancelled: {
          // }

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
