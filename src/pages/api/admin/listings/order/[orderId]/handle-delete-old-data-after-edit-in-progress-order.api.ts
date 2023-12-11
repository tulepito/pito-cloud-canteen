import difference from 'lodash/difference';
import last from 'lodash/last';
import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import { getEditedSubOrders } from '@helpers/orderHelper';
import { deleteFirebaseDocumentById } from '@pages/api/participants/document/document.service';
import cookies from '@services/cookie';
import { fetchListing } from '@services/integrationHelper';
import {
  deletePaymentRecordByIdOnFirebase,
  queryPaymentRecordOnFirebase,
} from '@services/payment';
import { handleError } from '@services/sdk';
import { Listing } from '@src/utils/data';
import { EPaymentType } from '@src/utils/enums';
import type { TObject } from '@src/utils/types';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const apiMethod = req.method;

    switch (apiMethod) {
      case HttpMethod.PUT:
        {
          const { planId } = req.body;
          const { orderId } = req.query;

          const plan = await fetchListing(planId);

          const planListing = Listing(plan);

          const { orderDetail = {} } = planListing.getMetadata();
          const editedSubOrders = getEditedSubOrders(orderDetail);

          const paymentRecords =
            (await queryPaymentRecordOnFirebase({
              paymentType: EPaymentType.PARTNER,
              orderId,
            })) || [];

          const clientPaymentRecords =
            (await queryPaymentRecordOnFirebase({
              paymentType: EPaymentType.CLIENT,
              orderId,
            })) || [];

          const handlePartnerDeletePaymentRecord = paymentRecords.map(
            async (paymentRecord) => {
              await deletePaymentRecordByIdOnFirebase(paymentRecord.id);
            },
          );

          const handleClientDeletePaymentRecord = clientPaymentRecords.map(
            async (paymentRecord) => {
              await deletePaymentRecordByIdOnFirebase(paymentRecord.id);
            },
          );

          const handleParticipantDeleteSubOrders = Object.keys(
            editedSubOrders,
          ).map(async (subOrderDate: string) => {
            const { oldValues, restaurant } = editedSubOrders[subOrderDate];
            const { foodList = {} } = restaurant;

            const previousOldValues = last<TObject>(oldValues) || {};

            const { restaurant: oldRestaurant, memberOrders: oldMembers } =
              previousOldValues;
            const { foodList: oldFoodList } = oldRestaurant;
            const deletedFoods = difference(
              Object.keys(oldFoodList),
              Object.keys(foodList),
            );

            const participantsWithDeletedFood = Object.keys(oldMembers).filter(
              (memberId: string) =>
                deletedFoods.includes(oldMembers[memberId].foodId),
            );

            const deleleSubOrderFromFirebaseAndSendNotification =
              participantsWithDeletedFood.map(async (participantId: string) => {
                const subOrderId = `${participantId} - ${planId} - ${subOrderDate}`;
                await deleteFirebaseDocumentById(subOrderId);
              });

            await Promise.all(deleleSubOrderFromFirebaseAndSendNotification);
          });

          await Promise.allSettled([
            handlePartnerDeletePaymentRecord,
            handleParticipantDeleteSubOrders,
            handleClientDeletePaymentRecord,
          ]);

          res.end();
        }
        break;
      default:
        break;
    }
  } catch (error) {
    console.error(error);
    handleError(res, error);
  }
}

export default cookies(handler);
