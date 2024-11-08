const { Listing, User } = require('../utils/data');

const { emailSendingFactory } = require('./awsSES/sendEmail');
const { sendNativeNotification } = require('./native/sendNotification');
const { NATIVE_NOTIFICATION_TYPES } = require('./native/config');
const { EmailTemplateTypes } = require('./awsSES/config');
const getIntegrationSdk = require('../utils/integrationSdk');
const { fetchUser } = require('../utils/integrationHelper');
const { ORDER_STATES } = require('../utils/enums');
const { getPickFoodParticipants } = require('./helpers/order');
const { createSlackNotification } = require('./slackNotification');
const { SLACK_NOTIFICATION_TYPE } = require('../utils/enums');
const { convertDateToVNTimezone } = require('./helpers/date');

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

  createSlackNotification(
    SLACK_NOTIFICATION_TYPE.ORDER_STATUS_CHANGES_TO_IN_PROGRESS,
    {
      orderStatusChangesToInProgressData: {
        orderCode: orderListing.attributes.title,
        orderLink: `${process.env.CANONICAL_ROOT_URL}/admin/order/${orderId}`,
        orderName: orderListing.attributes.publicData.orderName,
        companyName: orderListing.attributes.metadata.companyName,
        startDate: convertDateToVNTimezone(
          new Date(orderListing.attributes.metadata.startDate),
        ).split('T')[0],
        deliveryHour: orderListing.attributes.metadata.deliveryHour,
        deliveryAddress:
          orderListing.attributes.metadata.deliveryAddress.address,
      },
    },
  );
};

module.exports = { startOrder };
