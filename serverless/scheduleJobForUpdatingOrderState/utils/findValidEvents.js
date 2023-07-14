const get = require('lodash/get');
const isEmpty = require('lodash/isEmpty');
const { FlexEvent } = require('./data');
const { Transitions } = require('./constants');

const findValidEvents = (events) => {
  return events.filter((event) => {
    const normalizedEvent = FlexEvent(event);
    const { resourceId, data } = normalizedEvent.getResource();

    if (isEmpty(resourceId)) {
      return false;
    }

    const { lastTransition, metadata = {} } = get(data, 'attributes', {});
    const { isLastTxOfPlan = false, orderId } = metadata;

    return (
      !isEmpty(orderId) &&
      isLastTxOfPlan &&
      [
        Transitions.cancelDelivery,
        Transitions.operatorCancelPlan,
        Transitions.completeDelivery,
      ].includes(lastTransition)
    );
  });
};

module.exports = {
  findValidEvents,
};
