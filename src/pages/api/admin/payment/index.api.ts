import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import cookies from '@services/cookie';
import type { PaymentBaseParams } from '@services/payment';
import {
  createPaymentRecordOnFirebase,
  deletePaymentRecordByIdOnFirebase,
  queryPaymentRecordOnFirebase,
} from '@services/payment';
import { handleError } from '@services/sdk';
import { EPaymentType } from '@src/utils/enums';

import { checkPaymentRecordValid } from './check-valid-payment.service';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const apiMethod = req.method;
  try {
    switch (apiMethod) {
      case HttpMethod.GET:
        {
          const { JSONParams } = req.query;
          const { dataParams } = JSON.parse(JSONParams as string) || {};
          const { paymentType, orderId } = dataParams;

          const paymentRecords = await queryPaymentRecordOnFirebase({
            paymentType,
            orderId,
          });
          if (paymentType === EPaymentType.PARTNER) {
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

            res.json(groupPaymentRecordsBySubOrderDate);
          } else {
            res.json(paymentRecords);
          }
        }
        break;
      case HttpMethod.POST:
        {
          const { paymentRecordParams, paymentRecordType } = req.body;
          const {
            SKU,
            amount,
            paymentNote,
            orderId,
            partnerId,
            partnerName,
            subOrderDate,
            companyName,
            orderTitle,
            totalPrice,
            deliveryHour,
            isHideFromHistory,
          } = paymentRecordParams;

          const canCreatePaymentRecord = await checkPaymentRecordValid(
            paymentRecordParams,
            paymentRecordType,
          );
          if (!canCreatePaymentRecord) {
            return res.status(400).json({
              message: 'Payment record is invalid',
            });
          }

          const allowedPaymentRecordParams: Partial<PaymentBaseParams> = {
            SKU,
            amount,
            paymentNote,
            orderId,
            ...(partnerId ? { partnerId } : {}),
            ...(partnerName ? { partnerName } : {}),
            ...(subOrderDate ? { subOrderDate } : {}),
            ...(companyName ? { companyName } : {}),
            ...(orderTitle ? { orderTitle } : {}),
            ...(totalPrice ? { totalPrice } : {}),
            ...(deliveryHour ? { deliveryHour } : {}),
            ...(isHideFromHistory ? { isHideFromHistory } : {}),
          };
          const newPaymentRecord = await createPaymentRecordOnFirebase(
            paymentRecordType,
            allowedPaymentRecordParams,
          );

          res.json(newPaymentRecord);
        }
        break;

      case HttpMethod.DELETE:
        {
          const { paymentRecordId } = req.body;
          await deletePaymentRecordByIdOnFirebase(paymentRecordId);

          res.end();
        }
        break;
      default:
        break;
    }
  } catch (error) {
    handleError(res, error);
  }
}

export default cookies(handler);
