const isEmpty = require('lodash/isEmpty');

exports.handler = async (_event) => {
  // const handler = async () => {
  try {
    console.log('Start to run schedule to start order ...');
    console.log('_event: ', _event);
    const { orderId, planId } = _event;

    if (isEmpty(orderId) || isEmpty(planId)) {
      console.error('Missing orderId or planId');

      return;
    }
  } catch (error) {
    console.error(
      'Schedule automatic start order error',
      error?.data ? error?.data?.errors[0] : error,
    );
  }
};

// handler();
