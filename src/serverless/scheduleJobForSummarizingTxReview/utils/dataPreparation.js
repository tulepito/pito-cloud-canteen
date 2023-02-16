const lodashGet = require('lodash/get');
const { integrationSdk } = require('./sdk');
const { eventTriggerUserId } = require('../configs');

const getLatestSequenceId = async () => {
  const res = await integrationSdk.users.show({ id: eventTriggerUserId });
  const result = lodashGet(
    res,
    'data.data.attributes.profile.privateData.latestSequenceIdForSummarizeTxReview',
    null,
  );
  return result;
};

const setLatestEventSequenceId = async (sequenceId) => {
  return integrationSdk.users.updateProfile({
    id: eventTriggerUserId,
    privateData: {
      latestSequenceIdForSummarizeTxReview: sequenceId,
    },
  });
};

const queryEventsByEventType = async (eventTypes) => {
  const startAfterSequenceId = await getLatestSequenceId();

  return startAfterSequenceId
    ? integrationSdk.events.query({
        eventTypes,
        startAfterSequenceId,
      })
    : integrationSdk.events.query({
        eventTypes,
        createdAtStart: new Date(),
      });
};

const verifyTx = (tx, requiredTransitions) =>
  requiredTransitions.some(
    (requiredTransition) =>
      tx.attributes.resource.attributes.lastTransition === requiredTransition,
  );

const removeDuplicatedId = (originList) => [...new Set(originList)];

module.exports = {
  queryEventsByEventType,
  verifyTx,
  removeDuplicatedId,
  setLatestEventSequenceId,
};
