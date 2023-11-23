const { Listing, User } = require('../utils/data');

const { emailSendingFactory } = require('./awsSES/sendEmail');
const { sendNativeNotification } = require('./native/sendNotification');
const { NATIVE_NOTIFICATION_TYPES } = require('./native/config');
const { EmailTemplateTypes } = require('./awsSES/config');
const getIntegrationSdk = require('../utils/integrationSdk');
const { fetchUser } = require('../utils/integrationHelper');
const { ORDER_STATES } = require('../utils/enums');
const { getPickFoodParticipants } = require('./helpers/order');

const integrationSdk = getIntegrationSdk();

const startOrder = async ({
  orderListing,
  orderDetail,
  systemVATPercentage,
}) => {
  const listingGetter = Listing(orderListing);
  const orderId = listingGetter.getId();
  const {
    companyId,
    orderStateHistory = [],
    hasSpecificPCCFee: orderHasSpecificPCCFee,
    specificPCCFee: orderSpecificPCCFee,
  } = listingGetter.getMetadata();

  const updateOrderStateHistory = orderStateHistory.concat([
    {
      state: ORDER_STATES.inProgress,
      updatedAt: new Date().getTime(),
    },
  ]);
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

  const shouldSendNativeNotificationParticipantIdList =
    getPickFoodParticipants(orderDetail);

  // TODO: send noti email
  emailSendingFactory(EmailTemplateTypes.BOOKER.BOOKER_ORDER_SUCCESS, {
    orderId,
  });

  shouldSendNativeNotificationParticipantIdList.map(async (participantId) => {
    sendNativeNotification(
      NATIVE_NOTIFICATION_TYPES.BookerTransitOrderStateToInProgress,
      {
        participantId,
        order: orderListing,
      },
    );
  });
};

module.exports = { startOrder };
