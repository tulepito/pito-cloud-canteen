/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/naming-convention */
import isEmpty from 'lodash/isEmpty';
import omit from 'lodash/omit';
import { DateTime } from 'luxon';
import type { NextApiRequest, NextApiResponse } from 'next';

import { composeApiCheckers, HttpMethod } from '@apis/configs';
import { CustomError, EHttpStatusCode } from '@apis/errors';
import logger from '@helpers/logger';
import { pushNativeNotificationSubOrderDate } from '@pages/api/helpers/pushNotificationOrderDetailHelper';
import createQuotation from '@pages/api/orders/[orderId]/quotation/create-quotation.service';
import { createFoodRatingNotificationScheduler } from '@services/awsEventBrigdeScheduler';
import { emailSendingFactory, EmailTemplateTypes } from '@services/email';
import { fetchListing, fetchUser } from '@services/integrationHelper';
import {
  createNativeNotification,
  createNativeNotificationToBooker,
} from '@services/nativeNotification';
import { createFirebaseDocNotification } from '@services/notifications';
import adminChecker from '@services/permissionChecker/admin';
import { getIntegrationSdk, handleError } from '@services/sdk';
import {
  denormalisedResponseEntities,
  Listing,
  Transaction,
} from '@src/utils/data';
import { VNTimezone } from '@src/utils/dates';
import {
  EBookerNativeNotificationType,
  ENativeNotificationType,
  ENotificationType,
  EQuotationStatus,
} from '@src/utils/enums';
import { isTransactionsTransitionInvalidTransition } from '@src/utils/errors';
import { ETransition } from '@src/utils/transaction';
import type { TError } from '@src/utils/types';

import { modifyPaymentWhenCancelSubOrderService } from '../payment/modify-payment-when-cancel-sub-order.service';

import { transitionOrderStatus } from './transition-order-status.service';

const { TIME_TO_SEND_FOOD_RATING_NOTIFICATION } = process.env;

const _convertDateToVNTimezone = (date: Date) => {
  const dateInVNTimezone = DateTime.fromJSDate(date, {
    zone: VNTimezone,
  });

  return dateInVNTimezone.toISO().split('.')[0];
};

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const apiMethod = req.method;
    const integrationSdk = getIntegrationSdk();
    const { txId, transition } = req.body;

    if (isEmpty(txId) || isEmpty(transition)) {
      return handleError(
        res,
        new CustomError(
          'Missing transaction ID or transition',
          EHttpStatusCode.BadRequest,
        ),
      );
    }

    if (!Object.values(ETransition).includes(transition)) {
      return handleError(
        res,
        new CustomError(
          `Invalid transition: ${transition}`,
          EHttpStatusCode.BadRequest,
        ),
      );
    }

    switch (apiMethod) {
      case HttpMethod.POST: {
        const txResponse = await integrationSdk.transactions.transition(
          {
            id: txId,
            transition,
            params: {},
          },
          { expand: true, include: ['booking', 'listing', 'provider'] },
        );

        const tx = denormalisedResponseEntities(txResponse)[0];
        const txGetter = Transaction(tx);
        const {
          participantIds = [],
          orderId,
          anonymous = [],
        } = txGetter.getMetadata();
        const { booking, listing } = txGetter.getFullData();
        const listingGetter = Listing(listing);
        const restaurantId = listingGetter.getId();
        const { displayStart } = booking.attributes;
        const timestamp = new Date(displayStart).getTime();
        const startTimestamp = DateTime.fromMillis(timestamp)
          .setZone(VNTimezone)
          .startOf('day')
          .toMillis();
        const order = await fetchListing(orderId);
        const orderListing = Listing(order);
        const {
          plans = [],
          quotationId,
          companyId,
          bookerId,
        } = orderListing.getMetadata();
        const { title: orderTitle } = orderListing.getAttributes();
        const generalNotificationData = {
          orderId,
          orderTitle,
          planId: plans[0],
          subOrderDate: startTimestamp,
        };
        const plan = await fetchListing(plans[0]);
        const planListing = Listing(plan);
        const planId = planListing.getId();

        const booker = await fetchUser(bookerId);

        const { orderDetail = {} } = planListing.getMetadata();
        const { memberOrders = {}, restaurant = {} } =
          orderDetail[startTimestamp];
        const { foodList = {} } = restaurant;

        const updatePlanListing = async (lastTransition: string) => {
          const newOrderDetail = {
            ...orderDetail,
            [startTimestamp]: {
              ...orderDetail[startTimestamp],
              lastTransition,
            },
          };

          await integrationSdk.listings.update({
            id: planId,
            metadata: {
              orderDetail: newOrderDetail,
            },
          });
        };

        logger.info('Transition', transition);

        switch (transition) {
          case ETransition.START_DELIVERY: {
            [...participantIds, ...anonymous].forEach(
              (participantId: string) => {
                createFirebaseDocNotification(
                  ENotificationType.ORDER_DELIVERING,
                  {
                    ...generalNotificationData,
                    userId: participantId,
                  },
                );

                const { foodId } = memberOrders[participantId] || {};

                if (foodId) {
                  const { foodName = '' } = foodList[foodId];
                  createNativeNotification(
                    ENativeNotificationType.AdminTransitSubOrderToDelivering,
                    {
                      participantId,
                      planId,
                      subOrderDate: startTimestamp.toString(),
                      foodName,
                    },
                  );
                }
              },
            );
            createNativeNotificationToBooker(
              EBookerNativeNotificationType.SubOrderDelivering,
              {
                booker,
                order,
                subOrderDate: `${startTimestamp}`,
              },
            );
            break;
          }
          case ETransition.COMPLETE_DELIVERY: {
            [...participantIds, ...anonymous].forEach(
              (participantId: string) => {
                createFirebaseDocNotification(ENotificationType.ORDER_SUCCESS, {
                  ...generalNotificationData,
                  userId: participantId,
                });
                const { foodId } = memberOrders[participantId] || {};

                if (foodId) {
                  const { foodName = '' } = foodList[foodId];
                  createNativeNotification(
                    ENativeNotificationType.AdminTransitSubOrderToDelivered,
                    {
                      participantId,
                      planId,
                      subOrderDate: startTimestamp.toString(),
                      foodName,
                    },
                  );
                }
              },
            );

            const now = new Date();
            const numberOfMinutesDeferToSentFoodRatingNotification = Number(
              TIME_TO_SEND_FOOD_RATING_NOTIFICATION,
            );

            const _timeExpression = _convertDateToVNTimezone(
              new Date(
                now.setMinutes(
                  now.getMinutes() +
                    numberOfMinutesDeferToSentFoodRatingNotification,
                ),
              ),
            );

            createFoodRatingNotificationScheduler({
              customName: `sendFRN_${orderId}_${startTimestamp}`,
              timeExpression: _timeExpression,
              params: {
                orderId,
                participantIds,
                subOrderDate: startTimestamp,
                planId,
              },
            });

            createFirebaseDocNotification(
              ENotificationType.BOOKER_SUB_ORDER_COMPLETED,
              {
                userId: bookerId,
                orderId,
                subOrderDate: startTimestamp,
              },
            );
            createNativeNotificationToBooker(
              EBookerNativeNotificationType.SubOrderDelivered,
              {
                booker,
                order,
                subOrderDate: `${startTimestamp}`,
              },
            );

            await transitionOrderStatus(order, plan, integrationSdk);
            break;
          }
          case ETransition.OPERATOR_CANCEL_PLAN:
          case ETransition.OPERATOR_CANCEL_AFTER_PARTNER_CONFIRMED:
          case ETransition.OPERATOR_CANCEL_AFTER_PARTNER_REJECTED: {
            logger.info('Operator cancel plan', String(participantIds));
            // TODO:  send email notification to booker
            emailSendingFactory(
              EmailTemplateTypes.BOOKER.BOOKER_SUB_ORDER_CANCELED,
              {
                orderId,
                timestamp,
              },
            );
            // TODO: send email notification to participants and create native notifications
            [...participantIds, ...anonymous].forEach(
              (participantId: string) => {
                const { foodId } = memberOrders[participantId] || {};
                if (foodId) {
                  emailSendingFactory(
                    EmailTemplateTypes.PARTICIPANT
                      .PARTICIPANT_SUB_ORDER_CANCELED,
                    {
                      orderId,
                      timestamp,
                      participantId,
                    },
                  );
                  createNativeNotification(
                    ENativeNotificationType.AdminTransitSubOrderToCanceled,
                    {
                      participantId,
                      planId,
                      subOrderDate: startTimestamp.toString(),
                    },
                  );
                }
              },
            );

            // push notification when order from inprogress to cancel
            await pushNativeNotificationSubOrderDate(
              restaurantId,
              String(startTimestamp),
              order,
              ENativeNotificationType.AdminTransitSubOrderToCanceled,
              integrationSdk,
            );

            // Function is not ready on production
            if (process.env.NEXT_PUBLIC_ALLOW_PARTNER_EMAIL_SEND === 'true') {
              // TODO: send email notifications to partners
              emailSendingFactory(
                EmailTemplateTypes.PARTNER.PARTNER_SUB_ORDER_CANCELED,
                {
                  orderId,
                  timestamp,
                  restaurantId,
                },
              );
            }
            // TODO: create firebase notifications
            [...participantIds, ...anonymous].map(
              async (participantId: string) => {
                createFirebaseDocNotification(ENotificationType.ORDER_CANCEL, {
                  ...generalNotificationData,
                  userId: participantId,
                });
              },
            );

            // TODO: create new quotation
            const quotation = await fetchListing(quotationId);
            const quotationListing = Listing(quotation);
            const { client, partner } = quotationListing.getMetadata();
            const newClient = {
              ...client,
              quotation: omit(client.quotation, [`${startTimestamp}`]),
            };

            const newPartner = {
              ...partner,
              [restaurantId]: {
                ...partner[restaurantId],
                quotation: omit(partner[restaurantId].quotation, [
                  `${startTimestamp}`,
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
            console.log('run here');
            createFirebaseDocNotification(
              ENotificationType.BOOKER_SUB_ORDER_CANCELLED,
              {
                userId: bookerId,
                orderId,
                subOrderDate: startTimestamp,
              },
            );
            // TODO: update all payments records
            await Promise.allSettled([
              modifyPaymentWhenCancelSubOrderService({
                order,
                subOrderDate: startTimestamp,
                clientQuotation: newClient,
                partnerQuotation: newPartner,
              }),
              transitionOrderStatus(order, plan, integrationSdk),
              createNativeNotificationToBooker(
                EBookerNativeNotificationType.SubOrderCancelled,
                {
                  booker,
                  order,
                  subOrderDate: `${startTimestamp}`,
                },
              ),
            ]);
            break;
          }

          default:
            break;
        }

        await updatePlanListing(transition);

        return res.status(200).json({
          message: 'Successfully transit transaction',
          tx,
        });
      }
      default:
        break;
    }
  } catch (error) {
    logger.error('Error in admin/plan/transit.api.ts', String(error));

    if (isTransactionsTransitionInvalidTransition(error as TError)) {
      handleError(
        res,
        new CustomError('Invalid transition', EHttpStatusCode.Conflict),
      );
    } else {
      handleError(res, error);
    }
  }
}

export default composeApiCheckers(adminChecker)(handler);
