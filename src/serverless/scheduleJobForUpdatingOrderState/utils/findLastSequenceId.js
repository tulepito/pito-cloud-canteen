const { FlexEvent } = require('./data');

const findLastSequenceId = (events) => {
  let lastSequenceId;
  events.forEach((event) => {
    const normalizedEvent = FlexEvent(event);
    const seqId = normalizedEvent.getSequenceId();

    lastSequenceId = seqId;
  });

  return lastSequenceId;
};

module.exports = {
  findLastSequenceId,
};
