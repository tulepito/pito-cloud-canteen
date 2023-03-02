/* eslint-disable import/no-unresolved */
/* eslint-disable no-unused-vars */
const get = require('lodash/get');
const isEmpty = require('lodash/isEmpty');
const mapLimit = require('async/mapLimit');
const {
  queryEventsByEventType,
  setLatestEventSequenceId,
} = require('./utils/dataPreparation');
const { findValidEvents } = require('./utils/findValidEvents');
const { EventTypes } = require('./utils/constants');
const { denormalisedResponseEntities, FlexEvent } = require('./utils/data');
const { completeOrder } = require('./jobs');
const { findLastSequenceId } = require('./utils/findLastSequenceId');

exports.handler = async (_event, _context) => {
  // const handler = async () => {
  try {
    console.log(
      'Start to run schedule to scan transactions and update order data ...',
    );

    const eventTypes = EventTypes.transitTransaction;
    const eventList = denormalisedResponseEntities(
      await queryEventsByEventType(eventTypes),
    );
    const needHandleEvents = findValidEvents(eventList);
    const orderList = needHandleEvents.map((event) => {
      const normalizedEvent = FlexEvent(event);
      const { data } = normalizedEvent.getResource();
      const { orderId } = get(data, 'attributes.metadata', {});

      return orderId;
    });

    if (isEmpty(orderList)) {
      console.info('No order need to update state ...');
      return;
    }
    //
    console.info('Start to update order state ...');
    await mapLimit(orderList, 10, completeOrder);
    //
    console.info('Find last sequence id ...');
    const lastSequenceId = findLastSequenceId(eventList);
    console.info('Found id ', lastSequenceId);
    //
    if (lastSequenceId) {
      console.info('Update latest sequence id ...', lastSequenceId);
      setLatestEventSequenceId(lastSequenceId);
    }
  } catch (error) {
    console.error(
      'Schedule scan transaction and update order data',
      error?.data ? error?.data?.errors[0] : error,
    );
  }
};

// handler();
