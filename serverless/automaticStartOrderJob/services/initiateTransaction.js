const uniq = require('lodash/uniq');
const isEmpty = require('lodash/isEmpty');

const {
  normalizeOrderDetail,
  prepareNewPlanOrderDetail,
  checkIsOrderHasInProgressState,
} = require('./helpers/order');
const {
  createFirebaseDocNotification,
} = require('./firebase/createNotification');
const getIntegrationSdk = require('../utils/integrationSdk');
const {
  Listing,
  Transaction,
  User,
  denormalisedResponseEntities,
} = require('../utils/data');
const { formatTimestamp } = require('./helpers/date');
const { getSubAccountTrustedSdk } = require('../utils/subAccount');
const { fetchUser } = require('../utils/integrationHelper');
const {
  TRANSITIONS,
  ORDER_TYPES,
  PARTNER_VAT_SETTINGS,
} = require('../utils/enums');
const { NOTIFICATION_TYPES } = require('./firebase/config');
const {
  getSubOrdersWithNoTxId,
  getEditedSubOrders,
  getNextTransition,
} = require('./helpers/transaction');

const initiateTransaction = async ({
  orderId,
  planId,
  orderListing,
  planListing,
}) => {
  // Query order and plan listing
  const integrationSdk = getIntegrationSdk();

  const orderData = Listing(orderListing);
  const {
    companyId,
    deliveryHour,
    plans = [],
    orderType = ORDER_TYPES.group,
    companyName = 'PCC',
    orderVATPercentage,
    serviceFees = {},
    hasSpecificPCCFee = false,
    specificPCCFee = 0,
    orderStateHistory = [],
    partnerIds: orderPartnerIds = [],
  } = orderData.getMetadata();
  const isGroupOrder = orderType === ORDER_TYPES.group;
  const isOrderHasInProgressState =
    checkIsOrderHasInProgressState(orderStateHistory);

  if (plans.length === 0 || !plans.includes(planId)) {
    throw new Error(`Invalid planId, ${planId}`);
  }

  const companyAccount = await fetchUser(companyId);
  console.info('💫 > companyId: ', companyId);
  const { subAccountId } = companyAccount.attributes.profile.privateData;
  console.info('💫 > subAccountId: ', subAccountId);
  const companySubAccount = await fetchUser(subAccountId);
  console.info('💫 > companySubAccount: ', companySubAccount);
  const subAccountTrustedSdk = await getSubAccountTrustedSdk(companySubAccount);
  const { orderDetail: planOrderDetail = {} } =
    Listing(planListing).getMetadata();

  const subOrdersWithNoTxId = getSubOrdersWithNoTxId(planOrderDetail);
  // Normalize order detail
  const normalizedOrderDetail = normalizeOrderDetail({
    orderId,
    planId,
    planOrderDetail: subOrdersWithNoTxId,
    deliveryHour,
    isGroupOrder,
  });

  const transactionMap = {};
  const partnerIds = [];

  const editedSubOrders = getEditedSubOrders(planOrderDetail);
  if (isOrderHasInProgressState && !isEmpty(editedSubOrders)) {
    const handleUpdateTxs = Object.keys(editedSubOrders).map(
      async (subOrderDate) => {
        const { transactionId, lastTransition } = editedSubOrders[subOrderDate];

        const nextTransition = getNextTransition(lastTransition);

        await integrationSdk.transactions.transition({
          id: transactionId,
          transition: nextTransition,
          params: {},
        });

        delete editedSubOrders[subOrderDate].transactionId;
        delete editedSubOrders[subOrderDate].lastTransition;
      },
    );

    await Promise.all(handleUpdateTxs);
  }

  const normalizedEditedOrderDetail = normalizeOrderDetail({
    orderId,
    planId,
    planOrderDetail: editedSubOrders,
    deliveryHour,
    isGroupOrder,
  });

  const onCreateTx = async (item, index) => {
    const {
      params: {
        listingId,
        bookingStart,
        bookingEnd,
        bookingDisplayStart,
        bookingDisplayEnd,
        extendedData: { metadata },
      },
      date,
    } = item;
    partnerIds.push(listingId);

    const createTxResponse = await subAccountTrustedSdk.transactions.initiate(
      {
        processAlias: 'sub-order-transaction-process/release-2',
        transition: TRANSITIONS.INITIATE_TRANSACTION,
        params: {
          listingId,
          bookingStart,
          bookingEnd,
          bookingDisplayStart,
          bookingDisplayEnd,
          metadata: {
            ...metadata,
            timestamp: date,
            orderVATPercentage,
            serviceFees,
            hasSpecificPCCFee,
            specificPCCFee,
            subOrderName: `${companyName}_${formatTimestamp(
              bookingDisplayStart.getTime(),
            )}`,
            isLastTxOfPlan: index === normalizedOrderDetail.length - 1,
          },
        },
      },
      {
        include: ['provider'],
        expand: true,
      },
    );

    const [tx] = denormalisedResponseEntities(createTxResponse);
    const txGetter = Transaction(tx);

    const txId = Transaction(tx).getId();
    console.info('💫 > onCreateTx > txId: ', txId);
    const { provider } = txGetter.getFullData();

    createFirebaseDocNotification(NOTIFICATION_TYPES.SUB_ORDER_INPROGRESS, {
      userId: User(provider).getId(),
      planId,
      orderId,
      transition: TRANSITIONS.INITIATE_TRANSACTION,
      subOrderDate: bookingStart.getTime(),
      subOrderName: `${companyName}_${formatTimestamp(bookingStart.getTime())}`,
    });

    transactionMap[date] = txId;

    return txId;
  };
  // Initiate transaction for each date
  await Promise.all(normalizedOrderDetail.map(onCreateTx));
  await Promise.all(normalizedEditedOrderDetail.map(onCreateTx));

  const updateVatSettings = async (_partnerIds) => {
    const partnerListings = denormalisedResponseEntities(
      await integrationSdk.listings.query({
        ids: uniq(_partnerIds),
      }),
    );
    const vatSettings = partnerListings.reduce((res, partner) => {
      const partnerGetter = Listing(partner);
      const partnerId = partnerGetter.getId();

      const { vat = PARTNER_VAT_SETTINGS.vat } = partnerGetter.getPublicData();

      return {
        ...res,
        [partnerId]:
          vat in PARTNER_VAT_SETTINGS ? vat : PARTNER_VAT_SETTINGS.vat,
      };
    }, {});

    await integrationSdk.listings.update({
      id: orderId,
      metadata: {
        partnerIds: uniq(_partnerIds),
        vatSettings,
      },
    });
  };

  if (!isEmpty(subOrdersWithNoTxId)) {
    console.info('💫 > initiateTransaction > update orderDetail ');
    // Update new order detail of plan listing
    await integrationSdk.listings.update({
      id: planId,
      metadata: {
        orderDetail: prepareNewPlanOrderDetail(planOrderDetail, transactionMap),
      },
    });
    console.info('💫 > initiateTransaction > update vatSettings ');
    await updateVatSettings(partnerIds);
    console.info('💫 > initiateTransaction > updated vatSettings ');
  }
  if (!isEmpty(editedSubOrders)) {
    await integrationSdk.listings.update({
      id: planId,
      metadata: {
        orderDetail: {
          ...planOrderDetail,
          ...prepareNewPlanOrderDetail(editedSubOrders, transactionMap),
        },
      },
    });

    await updateVatSettings(orderPartnerIds);
  }
};

module.exports = { initiateTransaction };
