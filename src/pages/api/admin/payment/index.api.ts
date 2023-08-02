import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import cookies from '@services/cookie';
import {
  adminQueryListings,
  fetchListing,
  fetchUser,
} from '@services/integrationHelper';
import type { PaymentBaseParams } from '@services/payment';
import {
  createPaymentRecordOnFirebase,
  deletePaymentRecordByIdOnFirebase,
  queryPaymentRecordOnFirebase,
} from '@services/payment';
import { handleError } from '@services/sdk';
import { Listing, User } from '@src/utils/data';
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

          const order = await fetchListing(orderId, ['author']);

          const {
            startDate,
            endDate,
            bookerId,
            partnerIds = [],
            companyId,
          } = Listing(order).getMetadata();

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
          const bookerPhoneNumber =
            User(bookerUser).getProtectedData().phoneNumber;

          const allowedPaymentRecordParams: Partial<PaymentBaseParams> = {
            SKU,
            amount,
            orderId,
            ...(paymentNote ? { paymentNote } : {}),
            ...(partnerId ? { partnerId } : {}),
            ...(partnerName ? { partnerName } : {}),
            ...(companyName ? { companyName } : {}),
            ...(orderTitle ? { orderTitle } : {}),
            ...(totalPrice ? { totalPrice } : {}),
            ...(deliveryHour ? { deliveryHour } : {}),
            ...(isHideFromHistory ? { isHideFromHistory } : {}),
            ...(paymentRecordType === EPaymentType.CLIENT
              ? startDate && endDate
                ? { startDate, endDate }
                : {}
              : subOrderDate
              ? { subOrderDate }
              : {}),
            ...(restaurants ? { restaurants } : {}),
            ...(company
              ? {
                  company: {
                    companyName: User(company).getPublicData().companyName,
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
