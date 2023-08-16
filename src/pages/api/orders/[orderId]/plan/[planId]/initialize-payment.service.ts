import {
  calculatePriceQuotationInfo,
  calculatePriceQuotationPartner,
} from '@helpers/order/cartInfoHelper';
import { generateSKU } from '@pages/admin/order/[orderId]/helpers/AdminOrderDetail';
import {
  adminQueryListings,
  fetchListing,
  fetchUser,
} from '@services/integrationHelper';
import type { PaymentBaseParams } from '@services/payment';
import { createPaymentRecordOnFirebase } from '@services/payment';
import { Listing, User } from '@src/utils/data';
import { EPaymentType } from '@src/utils/enums';
import type { TListing } from '@src/utils/types';

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
  } = orderListingGetter.getMetadata();

  const quotationListing = await fetchListing(quotationId);
  const { partner = {} } = Listing(quotationListing).getMetadata();

  const { orderDetail = {} } = planListingGetter.getMetadata();
  const partnerPaymentRecordsData: Partial<PaymentBaseParams>[] =
    Object.entries(orderDetail).map(
      ([subOrderDate, subOrderData]: [string, any]) => {
        const { restaurant = {} } = subOrderData;
        const { id, restaurantName } = restaurant;
        const { totalWithVAT: totalPrice } = calculatePriceQuotationPartner({
          quotation: partner[id].quotation,
          serviceFeePercentage: serviceFees[id],
          currentOrderVATPercentage: orderVATPercentage,
          subOrderDate,
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
          totalPrice,
          deliveryHour,
          isHideFromHistory: true,
        };
      },
    );

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

  const { totalWithVAT: clientTotalPrice } = calculatePriceQuotationInfo({
    planOrderDetail: orderDetail,
    order: orderListing,
    currentOrderVATPercentage: orderVATPercentage,
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

  createPaymentRecordOnFirebase(EPaymentType.CLIENT, clientPaymentData);
};
