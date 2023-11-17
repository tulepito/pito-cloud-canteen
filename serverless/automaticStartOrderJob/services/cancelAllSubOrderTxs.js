const compact = require('lodash/compact');

const { TRANSITIONS } = require('../utils/enums');
const { transit } = require('./transit');

const cancelAllSubOrderTxs = async ({
  integrationSdk,
  planId,
  orderDetail,
}) => {
  const txInfos = compact(
    Object.keys(orderDetail).map((timestamp) => {
      const { transactionId, lastTransition } = orderDetail[timestamp];

      if (transactionId)
        return {
          transactionId,
          lastTransition,
          timestamp,
        };

      return null;
    }),
  );
  console.info('💫 > txInfos: ', txInfos);

  const newOrderDetail = orderDetail;

  await Promise.allSettled(
    txInfos.map(async ({ timestamp, transactionId, lastTransition }) => {
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

      if (nextTransition) {
        newOrderDetail[timestamp].lastTransition = lastTransition;

        return await transit(transactionId, nextTransition);
      }

      return null;
    }),
  );

  console.info('💫 > update order detail after transit: ');
  console.info(newOrderDetail);
  await integrationSdk.listings.update({
    id: planId,
    metadata: {
      orderDetail: newOrderDetail,
    },
  });
  console.info('💫 > updated order detail after transit');
};

module.exports = { cancelAllSubOrderTxs };
