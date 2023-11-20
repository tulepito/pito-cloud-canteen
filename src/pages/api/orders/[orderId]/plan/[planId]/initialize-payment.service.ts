import isEmpty from 'lodash/isEmpty';

import {
  calculatePriceQuotationInfoFromOrder,
  calculatePriceQuotationPartner,
  ensureVATSetting,
} from '@helpers/order/cartInfoHelper';
import {
  checkIsOrderHasInProgressState,
  getEditedSubOrders,
} from '@helpers/orderHelper';
import { generateSKU } from '@pages/admin/order/[orderId]/helpers/AdminOrderDetail';
import {
  adminQueryListings,
  fetchListing,
  fetchUser,
} from '@services/integrationHelper';
import type { PaymentBaseParams } from '@services/payment';
import {
  createPaymentRecordOnFirebase,
  queryPaymentRecordOnFirebase,
  updatePaymentRecordOnFirebase,
} from '@services/payment';
import { Listing, User } from '@src/utils/data';
import { EPaymentType } from '@src/utils/enums';
import type { TListing, TObject } from '@src/utils/types';

export const initializePayment = async (
  orderListing: TListing,
  planListing: TListing,
) => {
  const orderListingGetter = Listing(orderListing);
  const planListingGetter = Listing(planListing);

  const orderId = orderListingGetter.getId();
  const { title: orderTitle } = orderListingGetter.getAttributes();
  const {
    companyName,
    deliveryHour,
    orderVATPercentage,
    quotationId,
    serviceFees = {},
    vatSettings,
    orderStateHistory = [],
  } = orderListingGetter.getMetadata();

  const isOrderHasInProgressState =
    checkIsOrderHasInProgressState(orderStateHistory);

  const quotationListing = await fetchListing(quotationId);
  const { partner = {} } = Listing(quotationListing).getMetadata();

  const { orderDetail = {} } = planListingGetter.getMetadata();
  const editedSubOrders = getEditedSubOrders(orderDetail);

  const isEditInProgressOrder =
    isOrderHasInProgressState && !isEmpty(editedSubOrders);

  let partnerPaymentRecordsData: Partial<PaymentBaseParams>[] = [];

  const generatePaymentRecordData = (subOrders: TObject) => {
    return Object.entries(subOrders).map(
      ([subOrderDate, subOrderData]: [string, any]) => {
        const { restaurant = {} } = subOrderData;
        const { id, restaurantName } = restaurant;

        const vatSettingFromOrder = vatSettings[id];

        const { totalWithVAT } = calculatePriceQuotationPartner({
          quotation: partner[id].quotation,
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
      },
    );
  };

  partnerPaymentRecordsData = generatePaymentRecordData(orderDetail);

  const {
    startDate,
    endDate,
    bookerId,
    partnerIds = [],
    companyId,
    hasSpecificPCCFee = false,
    specificPCCFee = 0,
  } = orderListingGetter.getMetadata();

  const company = companyId ? await fetchUser(companyId) : null;

  const listings = await adminQueryListings({ ids: partnerIds });
  const restaurants = listings.reduce((prev: any, listing: any) => {
    const { title } = Listing(listing as any).getAttributes();
    const restaurantId = Listing(listing as any).getId();

    return [
      ...prev,
      {
        restaurantName: title,
        restaurantId,
      },
    ];
  }, [] as any);

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

  const clientPaymentData: Partial<PaymentBaseParams> = {
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

  partnerPaymentRecordsData.forEach((paymentRecordData) => {
    createPaymentRecordOnFirebase(EPaymentType.PARTNER, paymentRecordData);
  });

  if (isEditInProgressOrder) {
    const paymentRecords = await queryPaymentRecordOnFirebase({
      paymentType: EPaymentType.CLIENT,
      orderId,
    });

    if (!isEmpty(paymentRecords)) {
      await updatePaymentRecordOnFirebase(paymentRecords?.[0].id, {
        ...clientPaymentData,
      });
    }
  } else {
    createPaymentRecordOnFirebase(EPaymentType.CLIENT, clientPaymentData);
  }
};
