const { ORDER_STATES } = require('../utils/enums');
const { fetchListing } = require('../utils/integrationHelper');
const { denormalisedResponseEntities, Listing } = require('../utils/data');
const getIntegrationSdk = require('../utils/integrationSdk');
const { emailSendingFactory } = require('./awsSES/sendEmail');
const { NATIVE_NOTIFICATION_TYPES } = require('./native/config');
const { sendNativeNotification } = require('./native/sendNotification');
const { EmailTemplateTypes } = require('./awsSES/config');

const cancelPickingOrder = async (orderId) => {
  const integrationSdk = await getIntegrationSdk();
  const [orderListing] = denormalisedResponseEntities(
    await integrationSdk.listings.show({ id: orderId }),
  );

  const {
    orderState,
    orderStateHistory = [],
    plans = [],
    participants = [],
    anonymous = [],
  } = Listing(orderListing).getMetadata();

  if (orderState !== ORDER_STATES.picking) {
    throw new Error(`Order is not in picking state, orderState: ${orderState}`);
  }

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
