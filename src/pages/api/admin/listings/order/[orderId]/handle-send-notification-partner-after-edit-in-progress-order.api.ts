import isEmpty from 'lodash/isEmpty';
import last from 'lodash/last';
import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import { getEditedSubOrders } from '@helpers/orderHelper';
import cookies from '@services/cookie';
import { emailSendingFactory, EmailTemplateTypes } from '@services/email';
import { fetchListing } from '@services/integrationHelper';
import { createNativeNotification } from '@services/nativeNotification';
import { createFirebaseDocNotification } from '@services/notifications';
import {
  deletePaymentRecordByIdOnFirebase,
  queryPaymentRecordOnFirebase,
} from '@services/payment';
import { handleError } from '@services/sdk';
import { Listing, User } from '@src/utils/data';
import { formatTimestamp } from '@src/utils/dates';
import {
  ENativeNotificationType,
  ENotificationType,
  EPaymentType,
} from '@src/utils/enums';
import { ETransition } from '@src/utils/transaction';
import type { TObject } from '@src/utils/types';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const apiMethod = req.method;

    switch (apiMethod) {
      case HttpMethod.PUT:
        {
          const { planId } = req.body;
          const { orderId } = req.query;

          const plan = await fetchListing(planId);
          const order = await fetchListing(orderId as string);

          const planListing = Listing(plan);
          const orderListing = Listing(order);
          const { companyName } = orderListing.getMetadata();

          const { orderDetail = {} } = planListing.getMetadata();
          const editedSubOrders = getEditedSubOrders(orderDetail);

          const handlePartnerNotification = Object.keys(editedSubOrders).map(
            async (subOrderDate: string) => {
              const { oldValues, restaurant } = editedSubOrders[subOrderDate];
              const previousOldValues = last<TObject>(oldValues) || {};
              const { restaurant: oldRestaurant } = previousOldValues;

              if (isEmpty(oldRestaurant)) {
                return null;
              }

              const handleDeletePaymentRecord = async () => {
                const paymentRecord = await queryPaymentRecordOnFirebase({
                  paymentType: EPaymentType.PARTNER,
                  orderId,
                  partnerId: oldRestaurant.id,
                  subOrderDate,
                });

                if (!isEmpty(paymentRecord)) {
                  await deletePaymentRecordByIdOnFirebase(
                    paymentRecord?.[0].id,
                  );
                }
              };

              const oldRestaurantListing = await fetchListing(
                oldRestaurant.id,
                ['author'],
              );
              const oldRestaurantUser = oldRestaurantListing.author;

              const oldRestaurantUserId = User(oldRestaurantUser).getId();

              if (restaurant.id !== oldRestaurant.id) {
                emailSendingFactory(
                  EmailTemplateTypes.PARTNER.PARTNER_SUB_ORDER_CANCELED,
                  {
                    orderId,
                    restaurantId: oldRestaurant.id,
                    timestamp: subOrderDate,
                  },
                );
                createFirebaseDocNotification(
                  ENotificationType.SUB_ORDER_CANCELED,
                  {
                    userId: oldRestaurantUserId,
                    planId,
                    orderId: orderId as string,
                    transition: ETransition.INITIATE_TRANSACTION,
                    subOrderDate: Number(subOrderDate),
                    subOrderName: `${companyName}_${formatTimestamp(
                      Number(subOrderDate),
                    )}`,
                    companyName,
                  },
                );
                createNativeNotification(
                  ENativeNotificationType.PartnerTransitOrderToCanceled,
                  {
                    order,
                    participantId: oldRestaurantUserId,
                    subOrderDate,
                  },
                );

                await handleDeletePaymentRecord();
              } else {
                emailSendingFactory(
                  EmailTemplateTypes.PARTNER.PARTNER_ORDER_DETAILS_UPDATED,
                  {
                    orderId,
                    restaurantId: oldRestaurant.id,
                    timestamp: subOrderDate,
                  },
                );
                createNativeNotification(
                  ENativeNotificationType.PartnerEditSubOrder,
                  {
                    order,
                    participantId: oldRestaurantUserId,
                    subOrderDate,
                  },
                );
                await handleDeletePaymentRecord();
              }
            },
          );

          await Promise.all(handlePartnerNotification);

          res.end();
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

export default cookies(handler);
