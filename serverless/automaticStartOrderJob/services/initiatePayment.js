const isEmpty = require('lodash/isEmpty');
const { Listing, User } = require('../utils/data');
const { PAYMENT_TYPES } = require('../utils/enums');
const { fetchUser, queryListings } = require('../utils/integrationHelper');
const {
  calculatePriceQuotationInfoFromOrder,
  checkIsOrderHasInProgressState,
  ensureVATSetting,
  calculatePriceQuotationPartner,
} = require('./helpers/order');
const {
  createPaymentRecordOnFirebase,
  updatePaymentRecordOnFirebase,
  queryPaymentRecordOnFirebase,
} = require('./firebase/payment');
const { getEditedSubOrders } = require('./helpers/transaction');

const generateSKU = (role, orderTitle) => {
  const random4DigitsNumber = Math.floor(1000 + Math.random() * 9000);

  return `${random4DigitsNumber}-${role}-${orderTitle}`;
};

const initiatePayment = async (orderListing, planListing, quotationListing) => {
  const orderListingGetter = Listing(orderListing);
  const planListingGetter = Listing(planListing);

  const orderId = orderListingGetter.getId();
  const { title: orderTitle } = orderListingGetter.getAttributes();
  const {
    companyName,
    deliveryHour,
    orderVATPercentage,
    serviceFees = {},
    vatSettings = {},
    orderStateHistory = [],
    startDate,
    endDate,
    bookerId,
    partnerIds = [],
    companyId,
    hasSpecificPCCFee = false,
    specificPCCFee = 0,
  } = orderListingGetter.getMetadata();
  const { partner = {} } = Listing(quotationListing).getMetadata();
  const { orderDetail = {} } = planListingGetter.getMetadata();

  const isOrderHasInProgressState =
    checkIsOrderHasInProgressState(orderStateHistory);
  const editedSubOrders = getEditedSubOrders(orderDetail);

  const isEditInProgressOrder =
    isOrderHasInProgressState && !isEmpty(editedSubOrders);

  const generatePaymentRecordData = (subOrders) => {
    return Object.entries(subOrders).map(([subOrderDate, subOrderData]) => {
      const { restaurant = {} } = subOrderData;
      const { id, restaurantName } = restaurant;

      const vatSettingFromOrder = vatSettings[id];
      const { totalWithVAT } = calculatePriceQuotationPartner({
        quotation: partner[id]?.quotation,
        serviceFeePercentage: serviceFees[id],
        orderVATPercentage,
        subOrderDate,
        vatSetting: ensureVATSetting(vatSettingFromOrder),
      });

      return {
        SKU: generateSKU('PARTNER', orderId),
        amount: 0,
        paymentNote: '',
        orderId,
        partnerId: id,
        partnerName: restaurantName,
        subOrderDate,
        companyName,
        orderTitle,
        totalPrice: totalWithVAT,
        deliveryHour,
        isHideFromHistory: true,
        isAdminConfirmed: false,
      };
    });
  };

  const partnerPaymentRecordsData = generatePaymentRecordData(orderDetail);
  partnerPaymentRecordsData.forEach((paymentRecordData) => {
    createPaymentRecordOnFirebase(PAYMENT_TYPES.partner, paymentRecordData);
  });

  const company = companyId ? await fetchUser(companyId) : null;
  const listings = await queryListings({ ids: partnerIds });
  const restaurants = listings.reduce((prev, listing) => {
    return [
      ...prev,
      {
        restaurantName: listing?.attributes?.title,
        restaurantId: listing?.id?.uuid,
      },
    ];
  }, []);

  const bookerUser = await fetchUser(bookerId);
  const bookerDisplayName = User(bookerUser).getProfile().displayName;
  const bookerPhoneNumber = User(bookerUser).getProtectedData().phoneNumber;

  const { totalWithVAT: clientTotalPrice } =
    calculatePriceQuotationInfoFromOrder({
      planOrderDetail: orderDetail,
      order: orderListing,
      orderVATPercentage,
      hasSpecificPCCFee,
      specificPCCFee,
    });

  const clientPaymentData = {
    SKU: generateSKU('CUSTOMER', orderId),
    amount: 0,
    orderId,
    paymentNote: '',
    companyName,
    isHideFromHistory: true,
    isAdminConfirmed: false,
    orderTitle,
    totalPrice: clientTotalPrice,
    deliveryHour,
    startDate,
    endDate,
    ...(restaurants ? { restaurants } : {}),
    ...(company
      ? {
          company: {
            companyName: companyName || '',
            companyId,
          },
        }
      : {}),
    ...(bookerUser
      ? {
          booker: {
            bookerDisplayName: bookerDisplayName || '',
            bookerPhoneNumber: bookerPhoneNumber || '',
            bookerId,
          },
        }
      : {}),
  };
  console.info('💫 > clientPaymentData: ', clientPaymentData);

  if (isEditInProgressOrder) {
    const paymentRecords = await queryPaymentRecordOnFirebase({
      paymentType: PAYMENT_TYPES.client,
      orderId,
    });

    if (!isEmpty(paymentRecords)) {
      await updatePaymentRecordOnFirebase(paymentRecords?.[0]?.id, {
        ...clientPaymentData,
      });
    }
  } else {
    await createPaymentRecordOnFirebase(
      PAYMENT_TYPES.client,
      clientPaymentData,
    );
  }
};

module.exports = { initiatePayment };
