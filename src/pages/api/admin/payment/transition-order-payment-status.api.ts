import type { NextApiRequest, NextApiResponse } from 'next';

import { calculatePaidAmountBySubOrderDate } from '@pages/admin/order/[orderId]/helpers/AdminOrderDetail';
import cookies from '@services/cookie';
import { fetchListing } from '@services/integrationHelper';
import { getIntegrationSdk } from '@services/integrationSdk';
import { queryPaymentRecordOnFirebase } from '@services/payment';
import { handleError } from '@services/sdk';
import { Listing } from '@src/utils/data';
import { EOrderStates, EPaymentType } from '@src/utils/enums';

import { calculateClientTotalPriceAndPaidAmount } from './check-valid-payment.service';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const integrationSdk = getIntegrationSdk();
  try {
    const { orderId, planId } = req.body;

    const order = await fetchListing(orderId);
    const orderListing = Listing(order);
    const { orderStateHistory, orderState } = orderListing.getMetadata();

    const plan = await fetchListing(planId);
    const planListing = Listing(plan);
    const { orderDetail } = planListing.getMetadata();

    // get all client payment records
    const clientPaymentRecords = await queryPaymentRecordOnFirebase({
      paymentType: EPaymentType.CLIENT,
      orderId,
    });

    const { clientTotalPrice, clientPaidAmount } =
      await calculateClientTotalPriceAndPaidAmount(
        orderId,
        clientPaymentRecords!,
      );

    const isClientPaidAmountEnough = clientTotalPrice - clientPaidAmount === 0;

    // get all partner payment records
    const partnerPaymentRecords = await queryPaymentRecordOnFirebase({
      paymentType: EPaymentType.PARTNER,
      orderId,
    });

    const groupPaymentRecordsBySubOrderDate = partnerPaymentRecords?.reduce(
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

    const subOrderDatePaymentStatus = Object.keys(
      groupPaymentRecordsBySubOrderDate,
    ).reduce((result: any, subOrderDate: string) => {
      const paymentRecords = groupPaymentRecordsBySubOrderDate[subOrderDate];
      const totalPrice = paymentRecords?.[0]?.totalPrice || 0;
      const paidAmount = calculatePaidAmountBySubOrderDate(paymentRecords);

      return {
        ...result,
        [subOrderDate]: totalPrice - paidAmount === 0,
      };
    }, {});

    const newOrderDetail = Object.keys(orderDetail).reduce(
      (result: any, subOrderDate: string) => {
        return {
          ...result,
          [subOrderDate]: {
            ...orderDetail[subOrderDate],
            isPaid: Boolean(subOrderDatePaymentStatus[subOrderDate]),
          },
        };
      },
      {},
    );

    // Update payment status for sub order date
    await integrationSdk.listings.update({
      id: planId,
      metadata: {
        orderDetail: newOrderDetail,
      },
    });

    const isPaymentNumberEqualToSubOrderDateNumber =
      Object.keys(orderDetail).length ===
      Object.keys(subOrderDatePaymentStatus).length;

    const isPartnerPaidAmountEnough = Object.values(
      subOrderDatePaymentStatus,
    ).every((status: any) => Boolean(status));

    const isOrderPendingPayment = orderState === EOrderStates.pendingPayment;
    const isOrderStateIncludePendingPayment = orderStateHistory.some(
      (state: any) => state.state === EOrderStates.pendingPayment,
    );

    await integrationSdk.listings.update({
      id: orderId,
      metadata: {
        isClientSufficientPaid: isClientPaidAmountEnough,
        isPartnerSufficientPaid:
          isPartnerPaidAmountEnough && isPaymentNumberEqualToSubOrderDateNumber,
        ...(isOrderPendingPayment &&
        isClientPaidAmountEnough &&
        isPartnerPaidAmountEnough &&
        isPaymentNumberEqualToSubOrderDateNumber
          ? {
              orderState: EOrderStates.completed,
              orderStateHistory: [
                ...orderStateHistory,
                {
                  state: EOrderStates.completed,
                  updatedAt: new Date().getTime(),
                },
              ],
            }
          : !isOrderPendingPayment && isOrderStateIncludePendingPayment
          ? {
              orderState: EOrderStates.pendingPayment,
              orderStateHistory: [
                ...orderStateHistory,
                {
                  state: EOrderStates.pendingPayment,
                  updatedAt: new Date().getTime(),
                },
              ],
            }
          : {}),
      },
    });

    res.json({
      message: 'Transition order payment status successfully',
    });
  } catch (error) {
    handleError(res, error);
  }
}

export default cookies(handler);
