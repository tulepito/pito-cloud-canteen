import type { NextApiRequest, NextApiResponse } from 'next';

import { calculatePaidAmountBySubOrderDate } from '@pages/admin/order/[orderId]/helpers/AdminOrderDetail';
import cookies from '@services/cookie';
import { fetchListing } from '@services/integrationHelper';
import { getIntegrationSdk } from '@services/integrationSdk';
import { queryPaymentRecordOnFirebase } from '@services/payment';
import { handleError } from '@services/sdk';
import { Listing } from '@src/utils/data';
import { EPaymentType } from '@src/utils/enums';

import { calculateClientTotalPriceAndPaidAmount } from './check-valid-payment.service';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const integrationSdk = getIntegrationSdk();
  try {
    const { orderId, planId } = req.body;

    const plan = await fetchListing(planId);
    const planListing = Listing(plan);
    const { orderDetail } = planListing.getMetadata();

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
            isPaid: subOrderDatePaymentStatus[subOrderDate],
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

    const isPartnerPaidAmountEnough = Object.values(
      subOrderDatePaymentStatus,
    ).every((status: any) => Boolean(status));

    if (isClientPaidAmountEnough && isPartnerPaidAmountEnough) {
      await integrationSdk.listings.update({
        id: orderId,
        metadata: {
          isPaid: true,
        },
      });

      res.json({
        message: 'Transition order payment status successfully',
      });
    } else {
      await integrationSdk.listings.update({
        id: orderId,
        metadata: {
          isPaid: false,
        },
      });
      res.status(200).json({
        message: 'Transition order payment status failed',
      });
    }
  } catch (error) {
    handleError(res, error);
  }
}

export default cookies(handler);
