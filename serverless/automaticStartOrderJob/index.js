const isEmpty = require('lodash/isEmpty');

const { startOrder } = require('./services/startOrder');
const { cancelAllSubOrderTxs } = require('./services/cancelAllSubOrderTxs');
const { cancelPickingOrder } = require('./services/cancelPickingOrder');

const { denormalisedResponseEntities, Listing } = require('./utils/data');
const getIntegrationSdk = require('./utils/integrationSdk');
const {
  isEnableToCancelOrder,
  checkIsOrderHasInProgressState,
} = require('./services/helpers/order');
const { ORDER_STATES } = require('./utils/enums');
const { getEditedSubOrders } = require('./services/helpers/transaction');

exports.handler = async (_event) => {
  // const handler = async (_event = {}) => {
  try {
    console.log('Start to run schedule to start order ...');
    const { orderId } = _event;
    console.debug('💫 > orderId: ', orderId);

    if (isEmpty(orderId)) {
      console.error('Missing orderId');

      return;
    }

    const integrationSdk = getIntegrationSdk();

    const [orderListing] = denormalisedResponseEntities(
      await integrationSdk.listings.show({
        id: orderId,
      }),
    );

    const {
      orderState,
      orderStateHistory,
      plans = [],
    } = Listing(orderListing).getMetadata();
    const planId = plans[0];

    if (isEmpty(planId)) {
      console.error('Missing planId');

      return;
    }

    if (orderState !== ORDER_STATES.picking) {
      console.error('💫 > Cannot start non-picking order');

      return;
    }

    const [planListing] = denormalisedResponseEntities(
      await integrationSdk.listings.show({
        id: planId,
      }),
    );
    const { orderDetail = {} } = Listing(planListing).getMetadata();
    // TODO: check condition to cancel order
    const shouldCancelOrder = isEnableToCancelOrder(orderDetail);
    const editedSubOrders = getEditedSubOrders(orderDetail);
    console.debug('💫 > editedSubOrders: ', editedSubOrders);

    if (shouldCancelOrder) {
      if (
        checkIsOrderHasInProgressState(orderStateHistory) &&
        !isEmpty(editedSubOrders)
      ) {
        console.debug('💫 > orderStateHistory: ', orderStateHistory);
        console.debug('💫 > canceling all sub order transactions');
        await cancelAllSubOrderTxs(orderDetail);
        console.debug('💫 > canceled all sub order transactions');
      }

      console.debug('💫 > canceling order');
      await cancelPickingOrder(orderId, orderListing);
      console.debug('💫 > canceled order');
    } else {
      console.debug('💫 > starting order');
      await startOrder(orderListing, planId);
      console.debug('💫 > started order');
    }
  } catch (error) {
    console.error('Schedule automatic start order error', error);
  }
};

// handler({
//   orderId: '655577c3-0a76-43e7-b13e-b294e5fd1043',
// });
