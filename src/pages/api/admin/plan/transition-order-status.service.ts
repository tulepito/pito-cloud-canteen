import compact from 'lodash/compact';

import { fetchTransaction, fetchUser } from '@services/integrationHelper';
import { createNativeNotificationToBooker } from '@services/nativeNotification';
import { Listing, Transaction } from '@src/utils/data';
import { EBookerNativeNotificationType, EOrderStates } from '@src/utils/enums';
import {
  ETransition,
  TRANSITIONS_TO_STATE_CANCELED,
} from '@src/utils/transaction';
import type { TListing } from '@src/utils/types';

export const transitionOrderStatus = async (
  order: TListing,
  plan: TListing,
  integrationSdk: any,
) => {
  const orderListing = Listing(order);
  const planListing = Listing(plan);
  const orderId = orderListing.getId();
  const {
    orderState,
    isClientSufficientPaid,
    isPartnerSufficientPaid,
    orderStateHistory = [],
    bookerId,
  } = orderListing.getMetadata();
  const { orderDetail = {} } = planListing.getMetadata();

  const isOrderInProgress = orderState === EOrderStates.inProgress;
  const isOrderPendingPayment = orderState === EOrderStates.pendingPayment;
  const isOrderSufficientPaid =
    isClientSufficientPaid && isPartnerSufficientPaid;

  const txIdList = compact(
    Object.values(orderDetail).map((item: any) => item.transactionId),
  );

  const txsLastTransitions = await Promise.all(
    txIdList.map(async (txId: string) => {
      const tx = await fetchTransaction(txId);
      const { lastTransition } = Transaction(tx).getAttributes();

      return lastTransition;
    }),
  );

  const isAllTransactionCompleted = txsLastTransitions.every(
    (transition: string) =>
      transition === ETransition.COMPLETE_DELIVERY ||
      TRANSITIONS_TO_STATE_CANCELED.includes(transition as ETransition),
  );

  const shouldTransitToOrderCompleted =
    isOrderSufficientPaid &&
    (isOrderPendingPayment || isOrderInProgress) &&
    isAllTransactionCompleted;

  const shouldTransitToOrderPendingPayment =
    isAllTransactionCompleted && !isOrderPendingPayment;

  if (shouldTransitToOrderCompleted) {
    await integrationSdk.listings.update({
      id: orderId,
      metadata: {
        orderState: EOrderStates.completed,
        orderStateHistory: [
          ...orderStateHistory,
          {
            state: EOrderStates.completed,
            updatedAt: new Date().getTime(),
          },
        ],
      },
    });
  } else if (shouldTransitToOrderPendingPayment) {
    await integrationSdk.listings.update({
      id: orderId,
      metadata: {
        orderState: EOrderStates.pendingPayment,
        orderStateHistory: [
          ...orderStateHistory,
          {
            state: EOrderStates.pendingPayment,
            updatedAt: new Date().getTime(),
          },
        ],
      },
    });
    const booker = await fetchUser(bookerId);
    createNativeNotificationToBooker(
      EBookerNativeNotificationType.OrderIsPendingPayment,
      {
        booker,
        order,
      },
    );
  }
};
