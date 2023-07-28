import { calculatePriceQuotationInfo } from '@helpers/order/cartInfoHelper';
import { calculatePaidAmountBySubOrderDate } from '@pages/admin/order/[orderId]/helpers/AdminOrderDetail';
import { fetchListing } from '@services/integrationHelper';
import type { PaymentBaseParams } from '@services/payment';
import { queryPaymentRecordOnFirebase } from '@services/payment';
import { Listing } from '@src/utils/data';
import { EPaymentType } from '@src/utils/enums';

export const checkPaymentRecordValid = async (
  paymentRecord: PaymentBaseParams,
  paymentType: EPaymentType,
) => {
  const { orderId, subOrderDate: subOrderDateParam, amount } = paymentRecord;
  if (amount === 0) return false;

  const paymentRecords = await queryPaymentRecordOnFirebase({
    paymentType,
    orderId,
  });

  const isPartnerPayment = paymentType === EPaymentType.PARTNER;

  if (isPartnerPayment) {
    const groupPaymentRecordsBySubOrderDate = paymentRecords?.reduce(
      (acc: any, cur: any) => {
        const { subOrderDate } = cur;
        if (!acc[subOrderDate]) {
          acc[subOrderDate] = [];
        }
        acc[subOrderDate].push(cur);

        return acc;
      },
      {},
    );

    const paymentRecordsBySubOrderDate =
      groupPaymentRecordsBySubOrderDate?.[subOrderDateParam!] || [];

    const totalPrice = paymentRecordsBySubOrderDate?.[0]?.totalPrice || 0;
    const paidAmount = calculatePaidAmountBySubOrderDate(
      paymentRecordsBySubOrderDate,
    );

    return totalPrice - paidAmount >= amount;
  }
  const order = await fetchListing(orderId);
  const orderListing = Listing(order);
  const { plans = [], orderVATPercentage } = orderListing.getMetadata();
  const plan = await fetchListing(plans[0]);
  const planListing = Listing(plan);
  const { orderDetail = {} } = planListing.getMetadata();
  const { totalWithVAT: clientTotalPrice } = calculatePriceQuotationInfo({
    planOrderDetail: orderDetail,
    order,
    currentOrderVATPercentage: orderVATPercentage,
  });
  const paidAmount = calculatePaidAmountBySubOrderDate(paymentRecords!);

  return clientTotalPrice - paidAmount >= amount;
};
