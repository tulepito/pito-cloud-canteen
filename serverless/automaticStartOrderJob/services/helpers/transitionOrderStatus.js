const compact = require('lodash/compact');

const { fetchTransaction } = require('../../utils/integrationHelper');
const { Listing, Transaction } = require('../../utils/data');

const {
  ORDER_STATES,
  TRANSITIONS,
  TRANSITIONS_TO_STATE_CANCELED,
} = require('../../utils/enums');

const transitionOrderStatus = async (order, plan, integrationSdk) => {
  const orderListing = Listing(order);
  const planListing = Listing(plan);
  const orderId = orderListing.getId();
  const {
    orderState,
    isClientSufficientPaid,
    isPartnerSufficientPaid,
    orderStateHistory = [],
  } = orderListing.getMetadata();
  const { orderDetail = {} } = planListing.getMetadata();

  const isOrderInProgress = orderState === ORDER_STATES.inProgress;
  const isOrderPendingPayment = orderState === ORDER_STATES.pendingPayment;
  const isOrderSufficientPaid =
    isClientSufficientPaid && isPartnerSufficientPaid;

  const txIdList = compact(
    Object.values(orderDetail).map((item) => item.transactionId),
  );

  const txsLastTransitions = await Promise.all(
    txIdList.map(async (txId) => {
      const tx = await fetchTransaction(txId);
      const { lastTransition } = Transaction(tx).getAttributes();

      return lastTransition;
    }),
  );

  const isAllTransactionCompleted = txsLastTransitions.every(
    (transition) =>
      transition === TRANSITIONS.COMPLETE_DELIVERY ||
      TRANSITIONS_TO_STATE_CANCELED.includes(transition),
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
        orderState: ORDER_STATES.completed,
        orderStateHistory: [
          ...orderStateHistory,
          {
            state: ORDER_STATES.completed,
            updatedAt: new Date().getTime(),
          },
        ],
      },
    });
  } else if (shouldTransitToOrderPendingPayment) {
    await integrationSdk.listings.update({
      id: orderId,
      metadata: {
        orderState: ORDER_STATES.pendingPayment,
        orderStateHistory: [
          ...orderStateHistory,
          {
            state: ORDER_STATES.pendingPayment,
            updatedAt: new Date().getTime(),
          },
        ],
      },
    });
  }
};

module.exports = { transitionOrderStatus };
