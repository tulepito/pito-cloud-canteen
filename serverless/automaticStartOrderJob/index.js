const isEmpty = require('lodash/isEmpty');
const { denormalisedResponseEntities } = require('./utils/data');
const getIntegrationSdk = require('./utils/integrationSdk');

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
    console.debug('💫 > handler > orderListing: ', orderListing);
    const [planListing] = denormalisedResponseEntities(
      await integrationSdk.listings.show({
        id: planId,
      }),
    );
    console.debug('💫 > handler > planListing: ', planListing);
  } catch (error) {
    console.error(
      'Schedule automatic start order error',
      error?.data ? error?.data?.errors[0] : error,
    );
  }
};

handler();
