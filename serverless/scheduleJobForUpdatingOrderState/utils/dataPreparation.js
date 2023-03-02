const lodashGet = require('lodash/get');
const { integrationSdk } = require('./sdk');
const { eventTriggerUserId } = require('../configs');
const { denormalisedResponseEntities } = require('./data');

const getLatestSequenceId = async () => {
  const res = await integrationSdk.users.show({ id: eventTriggerUserId });
  const result = lodashGet(
    res,
    'data.data.attributes.profile.privateData.latestSequenceIdForUpdateOrderState',
  );
  return result;
};

const setLatestEventSequenceId = async (sequenceId) => {
  return integrationSdk.users.updateProfile({
    id: eventTriggerUserId,
    privateData: {
      latestSequenceIdForUpdateOrderState: sequenceId,
    },
  });
};

const queryEventsByEventType = async (eventTypes) => {
  const startAfterSequenceId = await getLatestSequenceId();

  return startAfterSequenceId
    ? await integrationSdk.events.query({
        eventTypes,
        startAfterSequenceId,
      })
    : await integrationSdk.events.query({
        eventTypes,
        createdAtStart: new Date(),
      });
};

const showTransaction = async (id) => {
  return denormalisedResponseEntities(
    await integrationSdk.transactions.show({
      id,
      include: ['listing', 'booking'],
    }),
  );
};

const verifyTx = (tx, requiredTransitions) =>
  requiredTransitions.some(
    (requiredTransition) =>
      tx.attributes.resource.attributes.lastTransition === requiredTransition,
  );

const removeDuplicatedId = (originList) => [...new Set(originList)];

module.exports = {
  showTransaction,
  queryEventsByEventType,
  verifyTx,
  removeDuplicatedId,
  setLatestEventSequenceId,
};
