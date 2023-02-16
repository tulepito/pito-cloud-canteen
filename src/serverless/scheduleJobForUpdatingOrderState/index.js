// exports.handler = (event, context) => {

const { queryEventsByEventType } = require('./utils/dataPreparation');
const { EventTypes } = require('./utils/constants');

const handler = async () => {
  try {
    console.log(
      'Start to run schedule to scan transaction and update order data ...',
    );

    const eventTypes = EventTypes.transitTransaction;
    const eventList = await queryEventsByEventType(eventTypes);
    console.info(
      '🚀 ~ handler ~ eventList',
      JSON.stringify(eventList, null, 2),
    );
  } catch (error) {
    console.error(
      'Schedule scan transaction and update order data',
      error?.data ? error?.data?.errors[0] : error,
    );
  }
};

handler();
