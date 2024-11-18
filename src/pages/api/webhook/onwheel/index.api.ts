import omit from 'lodash/omit';
import { DateTime } from 'luxon';
import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import { transitionOrderStatus } from '@pages/api/admin/plan/transition-order-status.service';
import createQuotation from '@pages/api/orders/[orderId]/quotation/create-quotation.service';
import { emailSendingFactory, EmailTemplateTypes } from '@services/email';
import {
  adminQueryListings,
  fetchListing,
  fetchUser,
} from '@services/integrationHelper';
import { createNativeNotificationToBooker } from '@services/nativeNotification';
import { createFirebaseDocNotification } from '@services/notifications';
import { getIntegrationSdk, handleError } from '@services/sdk';
import { Listing, User } from '@src/utils/data';
import { VNTimezone } from '@src/utils/dates';
import {
  EBookerNativeNotificationType,
  EListingType,
  ENotificationType,
  EOnWheelOrderStatus,
  EQuotationStatus,
} from '@src/utils/enums';
import { ETransition } from '@src/utils/transaction';
import type { TObject } from '@src/utils/types';

const findSubOrderDate = (orderDetail: TObject, subOrderWeekDay: string) => {
  return Object.keys(orderDetail).find(
    (k) =>
      subOrderWeekDay ===
      DateTime.fromMillis(Number(k)).setZone(VNTimezone).weekday.toString(),
  );
};

const fetchData = async (orderTitle: string) => {
  const [order] = await adminQueryListings({
    keywords: orderTitle,
    meta_listingType: EListingType.order,
  });

  const { plans = [], companyId, bookerId } = Listing(order).getMetadata();
  const company = await fetchUser(companyId);
  const booker = await fetchUser(bookerId);
  const companyUser = User(company);
  const {
    companyLocation: { address: deliveryAddress },
  } = companyUser.getPublicData();

  const plan = await fetchListing(plans[0]);

  return {
    order,
    plan,
    deliveryAddress,
    booker,
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
          case EOnWheelOrderStatus.idle:
          case EOnWheelOrderStatus.assigning: {
            const distinctTrackingNumberPaths = path.reduce(
              (acc: any[], OWSubOrder: any) => {
                const { tracking_number: trackingNumber } = OWSubOrder;
                if (!trackingNumber) return acc;
                if (!trackingNumber.includes('-')) return acc; // Make sure it's a PCC sub order

                if (
                  !acc.find((item) => item.tracking_number === trackingNumber)
                ) {
                  acc.push(OWSubOrder);
                }

                return acc;
              },
              [],
            );

            await Promise.all(
              distinctTrackingNumberPaths.map(async (OWSubOrder: any) => {
                const { tracking_number: trackingNumber } = OWSubOrder;

                if (!trackingNumber) return;

                const [orderTitle, subOrderWeekDay] =
                  trackingNumber.split(/[_-]/);
                const { plan } = await fetchData(orderTitle);

                const planListing = Listing(plan);
                const planId = planListing.getId();
                const { orderDetail = {} } = planListing.getMetadata();
                const subOrderDate = findSubOrderDate(
                  orderDetail,
                  subOrderWeekDay,
                );

                if (!subOrderDate) return;

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

          case EOnWheelOrderStatus.completed:
          case EOnWheelOrderStatus.inProcess: {
            const distinctTrackingNumberPaths = path.reduce(
              (acc: any[], OWSubOrder: any) => {
                const { tracking_number: trackingNumber } = OWSubOrder;
                if (!trackingNumber) return acc;
                if (!trackingNumber.includes('-')) return acc; // Make sure it's a PCC sub order

                /**
                 * If the order is in process, get all tracking numbers and update the status
                 */
                if (event.status === EOnWheelOrderStatus.inProcess) {
                  if (
                    !acc.find((item) => item.tracking_number === trackingNumber)
                  ) {
                    acc.push(OWSubOrder);
                  }
                }

                /**
                 * If the order is completed, only get the tracking number of the path having status COMPLETED
                 */
                if (event.status === EOnWheelOrderStatus.completed) {
                  if (
                    !acc.find(
                      (item) => item.tracking_number === trackingNumber,
                    ) &&
                    OWSubOrder.status === 'COMPLETED'
                  ) {
                    acc.push(OWSubOrder);
                  }
                }

                return acc;
              },
              [],
            );

            await Promise.all(
              distinctTrackingNumberPaths.map(async (OWSubOrder: any) => {
                const { tracking_number: trackingNumber } = OWSubOrder;
                if (!trackingNumber) return;

                let transition;

                if (event.status === EOnWheelOrderStatus.completed) {
                  transition = ETransition.COMPLETE_DELIVERY;
                }

                if (event.status === EOnWheelOrderStatus.inProcess) {
                  transition = ETransition.START_DELIVERY;
                }

                if (!transition) return;

                const [orderTitle, subOrderWeekDay] =
                  trackingNumber.split(/[_-]/);
                const { order, plan, booker } = await fetchData(orderTitle);

                const planListing = Listing(plan);
                const planId = planListing.getId();
                const { orderDetail = {} } = planListing.getMetadata();
                const subOrderDate = findSubOrderDate(
                  orderDetail,
                  subOrderWeekDay,
                );

                if (!subOrderDate) return;

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
                const orderId = orderListing.getId() as string;
                const {
                  participantIds = [],
                  anonymous = [],
                  quotationId,
                  companyId,
                  bookerId,
                } = orderListing.getMetadata();
                const generalNotificationData = {
                  orderId,
                  orderTitle,
                  planId,
                  subOrderDate: Number(subOrderDate),
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
                  createNativeNotificationToBooker(
                    EBookerNativeNotificationType.SubOrderDelivering,
                    {
                      booker,
                      order,
                      subOrderDate,
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
                  createFirebaseDocNotification(
                    ENotificationType.BOOKER_SUB_ORDER_COMPLETED,
                    {
                      userId: bookerId,
                      orderId,
                      subOrderDate: Number(subOrderDate),
                    },
                  );
                  createNativeNotificationToBooker(
                    EBookerNativeNotificationType.SubOrderDelivered,
                    {
                      booker,
                      order,
                      subOrderDate,
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

                  emailSendingFactory(
                    EmailTemplateTypes.PARTNER.PARTNER_SUB_ORDER_CANCELED,
                    {
                      orderId,
                      timestamp: subOrderDate,
                      restaurantId: restaurant.id,
                    },
                  );

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

                  createFirebaseDocNotification(
                    ENotificationType.BOOKER_SUB_ORDER_CANCELLED,
                    {
                      userId: bookerId,
                      orderId,
                      subOrderDate: Number(subOrderDate),
                    },
                  );

                  createNativeNotificationToBooker(
                    EBookerNativeNotificationType.SubOrderCancelled,
                    {
                      booker,
                      order,
                      subOrderDate,
                    },
                  );
                  await transitionOrderStatus(order, plan, integrationSdk);
                }
              }),
            );

            return res.status(200).end();
          }

          case EOnWheelOrderStatus.cancelled: {
            const distinctTrackingNumberPaths = path.reduce(
              (acc: any[], OWSubOrder: any) => {
                const { tracking_number: trackingNumber } = OWSubOrder;
                if (!trackingNumber) return acc;
                if (!trackingNumber.includes('-')) return acc; // Make sure it's a PCC sub order

                if (
                  !acc.find((item) => item.tracking_number === trackingNumber)
                ) {
                  acc.push(OWSubOrder);
                }

                return acc;
              },
              [],
            );

            await Promise.all(
              distinctTrackingNumberPaths.map(async (OWSubOrder: any) => {
                const { tracking_number: trackingNumber } = OWSubOrder;
                if (!trackingNumber) return;

                const [orderTitle, subOrderWeekDay] =
                  trackingNumber.split(/[_-]/);
                const { plan } = await fetchData(orderTitle);

                const planListing = Listing(plan);
                const planId = planListing.getId();
                const { orderDetail = {} } = planListing.getMetadata();
                const subOrderDate = findSubOrderDate(
                  orderDetail,
                  subOrderWeekDay,
                );

                if (!subOrderDate) return;

                const subOrder = orderDetail[subOrderDate];
                const { isOnWheelOrderCreated = false } = subOrder;
                if (isOnWheelOrderCreated) {
                  const newOrderDetail = {
                    ...orderDetail,
                    [subOrderDate]: {
                      ...subOrder,
                      isOnWheelOrderCreated: false,
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
