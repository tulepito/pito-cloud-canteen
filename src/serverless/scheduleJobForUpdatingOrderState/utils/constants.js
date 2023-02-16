/* eslint-disable import/prefer-default-export */
const Transitions = {
  initiateTransaction: 'transition/initiate-transaction',
  expiredDelivery: 'transition/expired-delivery',
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

module.exports = { reviewedTransitions, Transitions, EventTypes };
