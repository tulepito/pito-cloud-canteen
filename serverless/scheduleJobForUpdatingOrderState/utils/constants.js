const OrderStates = {
  canceled: 'canceled',
  canceledByBooker: 'canceledByBooker',
  picking: 'picking',
  inProgress: 'inProgress',
  pendingPayment: 'pendingPayment',
  completed: 'completed',
  reviewed: 'reviewed',
};

const Transitions = {
  initiateTransaction: 'transition/initiate-transaction',
  expiredDelivery: 'transition/expired-delivery',
  expireStartDelivery: 'transition/expired-start-delivery',
  startDelivery: 'transition/start-delivery',
  operatorCancelPlan: 'transition/operator-cancel-plan',
  cancelDelivery: 'transition/cancel-delivery',
  completeDelivery: 'transition/complete-delivery',
  reviewRestaurant: 'transition/restaurant-review',
  reviewRestaurantAfterExpireTime:
    'transition/restaurant-review-after-expire-time',
  expiredReviewTime: 'transition/expired-review-time',
};

const EventTypes = {
  initiateTransaction: 'transaction/initiated',
  transitTransaction: 'transaction/transitioned',
  updateTransaction: 'transaction/updated',
};

const reviewedTransitions = [
  Transitions.reviewRestaurant,
  Transitions.reviewRestaurantAfterExpireTime,
];

module.exports = { reviewedTransitions, OrderStates, Transitions, EventTypes };
