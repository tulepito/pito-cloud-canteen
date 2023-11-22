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
  // const handler = async (_event) => {
  try {
    console.info('Start to run schedule to start order ...');
    const { orderId } = _event;
    console.info('💫 > orderId: ', orderId);

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
    console.info('💫 > orderListing: ');
    console.info(orderListing);

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
    console.info('💫 > planListing: ');
    console.info(planListing);
    const { orderDetail = {} } = Listing(planListing).getMetadata();
    console.info('💫 > orderDetail: ');
    console.info(orderDetail);

    // TODO: check condition to cancel order
    const shouldCancelOrder = isEnableToCancelOrder(orderDetail);
    console.info('💫 > shouldCancelOrder: ', shouldCancelOrder);
    const editedSubOrders = getEditedSubOrders(orderDetail);
    console.info('💫 > editedSubOrders: ');
    console.info(editedSubOrders);

    if (shouldCancelOrder) {
      if (
        checkIsOrderHasInProgressState(orderStateHistory) &&
        !isEmpty(editedSubOrders)
      ) {
        console.info('💫 > orderStateHistory: ', orderStateHistory);
        console.info('💫 > canceling all sub order transactions');
        await cancelAllSubOrderTxs({ planId, orderDetail, integrationSdk });
        console.info('💫 > canceled all sub order transactions');
      }

      console.info('💫 > canceling order');
      await cancelPickingOrder(orderId, orderListing);
      console.info('💫 > canceled order');
    } else {
      console.info('💫 > starting order');
      await startOrder(orderListing, planId);
      console.info('💫 > started order');
    }
  } catch (error) {
    console.error('Schedule automatic start order error');

    if (error.status && error.statusText && error.data) {
      const { status, statusText, data } = error;

      console.error({
        name: 'Local API request failed',
        status,
        statusText,
      });
      console.error(data);
    } else {
      console.error(error?.message);
    }
  }
};
