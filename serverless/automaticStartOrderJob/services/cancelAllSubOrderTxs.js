const compact = require('lodash/compact');

const { TRANSITIONS } = require('../utils/enums');
const { transit } = require('./transit');

const cancelAllSubOrderTxs = async (orderDetail) => {
  const txInfos = compact(
    Object.values(orderDetail).map(({ transactionId, lastTransition }) => {
      if (transactionId)
        return {
          transactionId,
          lastTransition,
        };

      return null;
    }),
  );
  console.debug('💫 > txInfos: ', txInfos);

  await Promise.allSettled(
    txInfos.map(async ({ transactionId, lastTransition }) => {
      let nextTransition;

      switch (lastTransition) {
        case TRANSITIONS.INITIATE_TRANSACTION:
          nextTransition = TRANSITIONS.OPERATOR_CANCEL_PLAN;
          break;

        case TRANSITIONS.PARTNER_CONFIRM_SUB_ORDER:
          nextTransition = TRANSITIONS.OPERATOR_CANCEL_AFTER_PARTNER_CONFIRMED;
          break;

        case TRANSITIONS.PARTNER_REJECT_SUB_ORDER:
          nextTransition = TRANSITIONS.OPERATOR_CANCEL_AFTER_PARTNER_REJECTED;
          break;
        default:
          break;
      }

      if (nextTransition) return await transit(transactionId, nextTransition);

      return null;
    }),
  );
};

module.exports = { cancelAllSubOrderTxs };
