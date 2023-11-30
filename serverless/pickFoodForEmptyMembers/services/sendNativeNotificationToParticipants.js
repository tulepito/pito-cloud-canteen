const get = require('lodash/get');
const { NATIVE_NOTIFICATION_TYPES } = require('./native/config');
const { sendNativeNotification } = require('./native/sendNotification');

module.exports = async ({
  allEmptyMembersIds,
  participantResponses,
  orderResponse,
  planResponse,
}) => {
  const planId = planResponse.id.uuid;
  const handlingSendNativeNotificationToParticipants = allEmptyMembersIds.map(
    async (participantId) => {
      await sendNativeNotification(
        NATIVE_NOTIFICATION_TYPES.ParticipantAutoPickFood,
        {
          participant: participantResponses.find(
            (participant) => participant.id.uuid === participantId,
          ),
          planId,
          startDate: get(orderResponse, 'attributes.metadata.startDate'),
          deadlineDate: get(orderResponse, 'attributes.metadata.deadlineDate'),
          deadlineHour: get(orderResponse, 'attributes.metadata.deadlineHour'),
        },
      );
    },
  );

  return handlingSendNativeNotificationToParticipants;
};
