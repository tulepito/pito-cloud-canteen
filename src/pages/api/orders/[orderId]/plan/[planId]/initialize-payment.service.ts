import { calculatePriceQuotationPartner } from '@helpers/order/cartInfoHelper';
import { generateSKU } from '@pages/admin/order/[orderId]/helpers/AdminOrderDetail';
import { fetchListing } from '@services/integrationHelper';
import type { PaymentBaseParams } from '@services/payment';
import { createPaymentRecordOnFirebase } from '@services/payment';
import { Listing } from '@src/utils/data';
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

  partnerPaymentRecordsData.forEach((paymentRecordData) => {
    createPaymentRecordOnFirebase(EPaymentType.PARTNER, paymentRecordData);
  });
};
