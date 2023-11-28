const ORDER_STATES = {
  canceled: 'canceled',
  canceledByBooker: 'canceledByBooker',
  picking: 'picking',
  inProgress: 'inProgress',
  pendingPayment: 'pendingPayment',
  completed: 'completed',
  reviewed: 'reviewed',
  expiredStart: 'expiredStart',
};

const PARTNER_VAT_SETTINGS = {
  vat: 'vat',
  noExportVat: 'noExportVat',
  direct: 'direct',
};

const TRANSITIONS = {
  INITIATE_TRANSACTION: 'transition/initiate-transaction',
  EXPIRED_START_DELIVERY: 'transition/expired-start-delivery',
  START_DELIVERY: 'transition/start-delivery',
  PARTNER_CONFIRM_SUB_ORDER: 'transition/partner-confirm-sub-order',
  PARTNER_REJECT_SUB_ORDER: 'transition/partner-reject-sub-order',
  EXPIRED_DELIVERY: 'transition/expired-delivery',
  OPERATOR_CANCEL_PLAN: 'transition/operator-cancel-plan',
  OPERATOR_CANCEL_AFTER_PARTNER_REJECTED:
    'transition/operator-cancel-after-partner-rejected',
  OPERATOR_CANCEL_AFTER_PARTNER_CONFIRMED:
    'transition/operator-cancel-after-partner-confirmed',
  CANCEL_DELIVERY: 'transition/cancel-delivery',
  COMPLETE_DELIVERY: 'transition/complete-delivery',
  REVIEW_RESTAURANT: 'transition/restaurant-review',
  REVIEW_RESTAURANT_AFTER_EXPIRE_TIME:
    'transition/restaurant-review-after-expire-time',
  EXPIRED_REVIEW_TIME: 'transition/expired-review-time',
};

const TRANSITIONS_TO_STATE_CANCELED = [
  TRANSITIONS.OPERATOR_CANCEL_AFTER_PARTNER_CONFIRMED,
  TRANSITIONS.OPERATOR_CANCEL_AFTER_PARTNER_REJECTED,
  TRANSITIONS.OPERATOR_CANCEL_PLAN,
];

const ORDER_TYPES = {
  normal: 'normal',
  group: 'group',
};

const PAYMENT_TYPES = {
  client: 'client',
  partner: 'partner',
};

module.exports = {
  ORDER_TYPES,
  ORDER_STATES,
  PARTNER_VAT_SETTINGS,
  TRANSITIONS,
  TRANSITIONS_TO_STATE_CANCELED,
  PAYMENT_TYPES,
};
