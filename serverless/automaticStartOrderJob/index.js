const isEmpty = require('lodash/isEmpty');

const { startOrder } = require('./services/startOrder');

const { denormalisedResponseEntities, Listing } = require('./utils/data');
const getIntegrationSdk = require('./utils/integrationSdk');
const { isEnableToCancelOrder } = require('./services/helpers/order');
const { ORDER_STATES } = require('./utils/enums');

// exports.handler = async (_event) => {
const handler = async (_event = {}) => {
  try {
    console.log('Start to run schedule to start order ...');
    console.log('_event: ', _event);
    const { orderId, planId } = _event;

    if (isEmpty(orderId) || isEmpty(planId)) {
      console.error('Missing orderId or planId');

      return;
    }

    const integrationSdk = getIntegrationSdk();

    const [orderListing] = denormalisedResponseEntities(
      await integrationSdk.listings.show({
        id: orderId,
      }),
    );

    const { orderState } = Listing(orderListing).getMetadata();

    if (orderState !== ORDER_STATES.picking) {
      console.error('Cannot start non-picking order');

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

    if (shouldCancelOrder) {
      console.debug('💫 > handler > shouldCancelOrder: ', shouldCancelOrder);
    } else {
      await startOrder(orderListing, planId);
    }
  } catch (error) {
    console.error(
      'Schedule automatic start order error',
      error?.data ? error?.data?.errors[0] : error,
    );
  }
};

handler();
