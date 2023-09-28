import type { NextApiRequest, NextApiResponse } from 'next';

import { calculatePaidAmountBySubOrderDate } from '@pages/admin/order/[orderId]/helpers/AdminOrderDetail';
import cookies from '@services/cookie';
import { fetchListing } from '@services/integrationHelper';
import { getIntegrationSdk } from '@services/integrationSdk';
import { queryPaymentRecordOnFirebase } from '@services/payment';
import { handleError } from '@services/sdk';
import { Listing } from '@src/utils/data';
import { EOrderStates, EPaymentType, ESubOrderStatus } from '@src/utils/enums';
import { ETransition } from '@src/utils/transaction';

import { calculateClientTotalPriceAndPaidAmount } from './check-valid-payment.service';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const integrationSdk = getIntegrationSdk();
  try {
    const { orderId, planId } = req.body;

    const order = await fetchListing(orderId);
    const orderListing = Listing(order);
    const {
      orderStateHistory,
      orderState,
      isClientSufficientPaid: currIsClientSufficientPaid = false,
    } = orderListing.getMetadata();

    const plan = await fetchListing(planId);
    const planListing = Listing(plan);
    const { orderDetail = {} } = planListing.getMetadata();

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
      if (
        !orderDetail[subOrderDate]?.transactionId ||
        (orderDetail[subOrderDate]?.transactionId &&
          orderDetail[subOrderDate]?.status === ESubOrderStatus.CANCELED) ||
        orderDetail[subOrderDate]?.lastTransition ===
          ETransition.OPERATOR_CANCEL_PLAN
      ) {
        return result;
      }
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
        const { isAdminPaymentConfirmed = false } =
          orderDetail[subOrderDate] || {};

        return {
          ...result,
          [subOrderDate]: {
            ...orderDetail[subOrderDate],
            isPaid:
              Boolean(subOrderDatePaymentStatus[subOrderDate]) ||
              isAdminPaymentConfirmed,
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

    const activeOrderDetail = Object.keys(orderDetail).reduce(
      (result: any, subOrderDate: string) => {
        if (
          !orderDetail[subOrderDate]?.transactionId ||
          (orderDetail[subOrderDate]?.transactionId &&
            orderDetail[subOrderDate]?.status === ESubOrderStatus.CANCELED) ||
          orderDetail[subOrderDate]?.lastTransition ===
            ETransition.OPERATOR_CANCEL_PLAN
        ) {
          return result;
        }

        return {
          ...result,
          [subOrderDate]: orderDetail[subOrderDate],
        };
      },
      {},
    );

    const isPaymentNumberEqualToSubOrderDateNumber =
      Object.keys(activeOrderDetail).length ===
      Object.keys(subOrderDatePaymentStatus).length;

    const isPartnerPaidAmountEnough = Object.keys(
      subOrderDatePaymentStatus,
    ).every((date: any) => {
      const status = subOrderDatePaymentStatus[date];
      const { isAdminPaymentConfirmed = false } = activeOrderDetail[date] || {};

      return isAdminPaymentConfirmed || Boolean(status);
    });

    const isOrderPendingPayment = orderState === EOrderStates.pendingPayment;
    const isOrderStateIncludePendingPaymentOrComplete = orderStateHistory.some(
      (state: any) =>
        state.state === EOrderStates.pendingPayment ||
        state.state === EOrderStates.completed,
    );

    await integrationSdk.listings.update({
      id: orderId,
      metadata: {
        isClientSufficientPaid:
          currIsClientSufficientPaid || isClientPaidAmountEnough,
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
          : !isOrderPendingPayment &&
            isOrderStateIncludePendingPaymentOrComplete
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
