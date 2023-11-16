const {
  denormalisedResponseEntities,
  Listing,
  User,
} = require('../utils/data');

const { emailSendingFactory } = require('./awsSES/sendEmail');
const { sendNativeNotification } = require('./native/sendNotification');
const { NATIVE_NOTIFICATION_TYPE } = require('./native/config');
const { EmailTemplateTypes } = require('./awsSES/config');
const getIntegrationSdk = require('../utils/integrationSdk');
const { fetchUser } = require('../utils/integrationHelper');
const { ORDER_STATES } = require('../utils/enums');
const { getPickFoodParticipants } = require('./helpers/order');
const { getSystemAttributes } = require('./helpers/attributes');

const integrationSdk = getIntegrationSdk();

const startOrder = async (orderListing, planId) => {
  const listingGetter = Listing(orderListing);
  const orderId = listingGetter.getId();
  const {
    companyId,
    orderStateHistory = [],
    partnerIds = [],
    hasSpecificPCCFee: orderHasSpecificPCCFee,
    specificPCCFee: orderSpecificPCCFee,
  } = listingGetter.getMetadata();

  const updateOrderStateHistory = orderStateHistory.concat([
    {
      state: ORDER_STATES.inProgress,
      updatedAt: new Date().getTime(),
    },
  ]);
  const { systemVATPercentage = 0 } = await getSystemAttributes();
  const companyUser = await fetchUser(companyId);
  const { hasSpecificPCCFee = false, specificPCCFee = 0 } =
    User(companyUser).getMetadata();

  // TODO: update state, save vat and PCC fee in order listing
  await integrationSdk.listings.update({
    id: orderId,
    metadata: {
      orderState: ORDER_STATES.inProgress,
      orderStateHistory: updateOrderStateHistory,
      orderVATPercentage: systemVATPercentage,
      isOrderAutomaticConfirmed: true,
      ...(orderHasSpecificPCCFee === undefined &&
        orderSpecificPCCFee === undefined && {
          hasSpecificPCCFee,
          specificPCCFee,
        }),
    },
  });

  const [plan] = denormalisedResponseEntities(
    await integrationSdk.listings.update(
      {
        id: planId,
        metadata: {
          partnerIds,
        },
      },
      {
        expand: true,
      },
    ),
  );
  const { orderDetail = {} } = Listing(plan).getMetadata();

  const shouldSendNativeNotificationParticipantIdList =
    getPickFoodParticipants(orderDetail);

  // TODO: send noti email
  emailSendingFactory(EmailTemplateTypes.BOOKER.BOOKER_ORDER_SUCCESS, {
    orderId,
  });

  shouldSendNativeNotificationParticipantIdList.map(async (participantId) => {
    sendNativeNotification(
      NATIVE_NOTIFICATION_TYPE.BookerTransitOrderStateToInProgress,
      {
        participantId,
        order: orderListing,
      },
    );
  });
};

module.exports = { startOrder };
