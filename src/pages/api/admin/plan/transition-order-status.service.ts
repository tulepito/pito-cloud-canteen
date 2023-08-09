import compact from 'lodash/compact';

import { fetchTransaction } from '@services/integrationHelper';
import { Listing, Transaction } from '@src/utils/data';
import { EOrderStates } from '@src/utils/enums';
import { ETransition } from '@src/utils/transaction';
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
  } = orderListing.getMetadata();
  const { orderDetail } = planListing.getMetadata();

  const isOrderPendingPayment = orderState === EOrderStates.pendingPayment;
  const isOrderSuficientPaid =
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
      transition === ETransition.OPERATOR_CANCEL_PLAN,
  );

  const shouldTransitToOrderCompleted =
    isOrderSuficientPaid && isOrderPendingPayment && isAllTransactionCompleted;

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
  }
};
