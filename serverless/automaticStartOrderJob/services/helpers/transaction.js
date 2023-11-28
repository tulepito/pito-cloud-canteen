const isEmpty = require('lodash/isEmpty');

const { TRANSITIONS } = require('../../utils/enums');

const getNextTransition = (lastTransition) => {
  switch (lastTransition) {
    case TRANSITIONS.INITIATE_TRANSACTION:
    case TRANSITIONS.PARTNER_CONFIRM_SUB_ORDER:
    case TRANSITIONS.PARTNER_REJECT_SUB_ORDER:
      return TRANSITIONS.OPERATOR_CANCEL_PLAN;

    // case partner reject & confirm sub order here

    default:
      break;
  }
};

const getEditedSubOrders = (orderDetail) => {
  const editedSubOrders = Object.keys(orderDetail).reduce(
    (result, subOrderDate) => {
      const { oldValues, lastTransition } = orderDetail[subOrderDate];
      if (
        isEmpty(oldValues) ||
        lastTransition !== TRANSITIONS.INITIATE_TRANSACTION
      ) {
        return result;
      }

      return {
        ...result,
        [subOrderDate]: orderDetail[subOrderDate],
      };
    },
    {},
  );

  return editedSubOrders;
};

const getSubOrdersWithNoTxId = (planOrderDetail) => {
  return Object.entries(planOrderDetail).reduce((prev, [date, orderOfDate]) => {
    const { transactionId } = orderOfDate;

    if (!transactionId) {
      return {
        ...prev,
        [date]: orderOfDate,
      };
    }

    return prev;
  }, {});
};

module.exports = {
  getSubOrdersWithNoTxId,
  getEditedSubOrders,
  getNextTransition,
};
