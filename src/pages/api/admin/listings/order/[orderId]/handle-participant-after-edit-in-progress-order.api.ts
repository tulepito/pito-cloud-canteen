import { difference, isEmpty, last } from 'lodash';
import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import { deleteFirebaseDocumentById } from '@pages/api/participants/document/document.service';
import cookies from '@services/cookie';
import { emailSendingFactory, EmailTemplateTypes } from '@services/email';
import { fetchListing } from '@services/integrationHelper';
import { handleError } from '@services/sdk';
import { Listing } from '@src/utils/data';
import { EParticipantOrderStatus } from '@src/utils/enums';
import { ETransition } from '@src/utils/transaction';
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
          const editedSubOrders = Object.keys(orderDetail).reduce(
            (result: any, subOrderDate: string) => {
              const { oldValues, lastTransition } = orderDetail[subOrderDate];
              if (
                isEmpty(oldValues) ||
                lastTransition !== ETransition.INITIATE_TRANSACTION
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

          const handleParticipantNotification = Object.keys(
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

                // TODO: send email to participant
                emailSendingFactory(
                  EmailTemplateTypes.PARTICIPANT
                    .PARTICIPANT_PICKING_ORDER_CHANGED,
                  {
                    participantId,
                    orderId,
                    timestamp: subOrderDate,
                  },
                );
              });

            await Promise.all(deleleSubOrderFromFirebaseAndSendNotification);

            const participantNotJoined = Object.keys(oldMembers).filter(
              (memberId: string) =>
                oldMembers[memberId].status ===
                EParticipantOrderStatus.notJoined,
            );

            participantNotJoined.map(async (participantId: string) => {
              // TODO: send email to participant
              console.log('send email to participant', participantId);
              emailSendingFactory(
                EmailTemplateTypes.PARTICIPANT
                  .PARTICIPANT_PICKING_ORDER_CHANGED,
                {
                  participantId,
                  orderId,
                  timestamp: subOrderDate,
                },
              );
            });
          });

          await Promise.all(handleParticipantNotification);
        }
        break;
      default:
        break;
    }
    res.end();
  } catch (error) {
    console.error(error);
    handleError(res, error);
  }
}

export default cookies(handler);
