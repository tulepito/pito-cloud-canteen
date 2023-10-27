import { difference, isEmpty } from 'lodash';
import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import { deleteFirebaseDocumentById } from '@pages/api/participants/document/document.service';
import cookies from '@services/cookie';
import { fetchListing } from '@services/integrationHelper';
import { handleError } from '@services/sdk';
import { Listing } from '@src/utils/data';
import { EParticipantOrderStatus } from '@src/utils/enums';
import type { TObject } from '@src/utils/types';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const apiMethod = req.method;

    switch (apiMethod) {
      case HttpMethod.PUT:
        {
          const { planId } = req.body;
          const plan = await fetchListing(planId);

          const planListing = Listing(plan);

          const { orderDetail = {} } = planListing.getMetadata();
          const editedSubOrders = Object.keys(orderDetail).reduce(
            (result: any, subOrderDate: string) => {
              const { oldValues } = orderDetail[subOrderDate];
              if (isEmpty(oldValues)) {
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
            const { oldValues, editTagVersion, restaurant } =
              editedSubOrders[subOrderDate];
            const { foodList = {} } = restaurant;

            const previousOldValues =
              editTagVersion === 1
                ? oldValues[0]
                : oldValues.find(
                    (_oldValue: TObject) =>
                      _oldValue.editTagVersion === editTagVersion - 1,
                  );

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
