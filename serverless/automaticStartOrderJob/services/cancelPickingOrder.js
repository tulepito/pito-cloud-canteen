const { ORDER_STATES } = require('../utils/enums');
const { fetchListing } = require('../utils/integrationHelper');
const { Listing } = require('../utils/data');
const getIntegrationSdk = require('../utils/integrationSdk');
const { emailSendingFactory } = require('./awsSES/sendEmail');
const { NATIVE_NOTIFICATION_TYPES } = require('./native/config');
const { sendNativeNotification } = require('./native/sendNotification');
const { EmailTemplateTypes } = require('./awsSES/config');

const cancelPickingOrder = async (orderId, orderListing) => {
  const integrationSdk = await getIntegrationSdk();

  const {
    orderStateHistory = [],
    plans = [],
    participants = [],
    anonymous = [],
  } = Listing(orderListing).getMetadata();

  await integrationSdk.listings.update({
    id: orderId,
    metadata: {
      orderState: ORDER_STATES.canceled,
      orderStateHistory: orderStateHistory.concat({
        state: ORDER_STATES.canceled,
        updatedAt: new Date().getTime(),
      }),
    },
  });

  // Email for booker about order cancel
  emailSendingFactory(EmailTemplateTypes.BOOKER.BOOKER_ORDER_CANCELLED, {
    orderId,
  });

  // Email for participants about plan cancel
  Promise.all(
    plans.map(async (planId) => {
      const plan = await fetchListing(planId);
      const { orderDetail = {} } = Listing(plan).getMetadata();
      [...participants, ...anonymous].forEach((participantId) => {
        sendNativeNotification(
          NATIVE_NOTIFICATION_TYPES.TransitOrderStateToCanceled,
          {
            participantId,
            planId,
            order: orderListing,
          },
        );
      });

      Promise.all(
        Object.keys(orderDetail).map((dateAsTimeStamp) => {
          const { memberOrders = {} } = orderDetail[dateAsTimeStamp] || {};

          const participantIds = [];

          Object.keys(memberOrders).forEach((partId) => {
            const { status, foodId } = memberOrders[partId] || {};
            if (status === 'joined' && !!foodId) {
              participantIds.push(partId);
            }
          });

          return participantIds.forEach((participantId) => {
            emailSendingFactory(
              EmailTemplateTypes.PARTICIPANT.PARTICIPANT_SUB_ORDER_CANCELED,
              {
                orderId,
                timestamp: dateAsTimeStamp,
                participantId,
              },
            );
          });
        }),
      );
    }),
  );
};

module.exports = { cancelPickingOrder };
