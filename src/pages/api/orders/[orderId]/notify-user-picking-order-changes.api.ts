import isEmpty from 'lodash/isEmpty';
import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import orderServices from '@pages/api/apiServices/order/index.service';
import cookies from '@services/cookie';
import { emailSendingFactory, EmailTemplateTypes } from '@services/email';
import { fetchListing } from '@services/integrationHelper';
import { createFirebaseDocNotification } from '@services/notifications';
import adminChecker from '@services/permissionChecker/admin';
import { handleError } from '@services/sdk';
import { CurrentUser } from '@src/utils/data';
import { ENotificationType } from '@src/utils/enums';
import type { TObject, TOrderChangeHistoryItem } from '@src/utils/types';

const handleCreatePartnerNotification = async ({
  plans,
  firebaseChangeHistory,
  companyName,
}: {
  plans: string[];
  firebaseChangeHistory: TOrderChangeHistoryItem[];
  companyName: string;
}) => {
  const plan = await fetchListing(plans[0]);
  const { orderDetail = {} } = plan.attributes.metadata || {};

  const groupedChangesBySubOrderDate = firebaseChangeHistory.reduce(
    (acc: TObject, curr: TOrderChangeHistoryItem) => {
      const { subOrderDate } = curr;
      if (!subOrderDate) return acc;

      const subOrderDateKey = subOrderDate.toString();

      if (!acc[subOrderDateKey]) {
        acc[subOrderDateKey] = [curr];
      } else {
        acc[subOrderDateKey] = [...acc[subOrderDateKey], curr];
      }

      return acc;
    },
    {},
  );

  Object.keys(groupedChangesBySubOrderDate).forEach(
    async (subOrderDate: string) => {
      try {
        const subOrder = orderDetail[subOrderDate];
        const restaurantId = subOrder?.restaurant?.id;
        const restaurant = await fetchListing(restaurantId, ['author']);
        const userId = restaurant?.author?.id.uuid;

        const changeItem = groupedChangesBySubOrderDate[subOrderDate][0];

        // if only 1 change, this change is change restaurant
        if (groupedChangesBySubOrderDate[subOrderDate].length === 1) {
          const oldRestaurantId = changeItem.oldValue?.id;
          const oldRestaurant = await fetchListing(oldRestaurantId, ['author']);
          const oldUserId = oldRestaurant?.author?.id.uuid;

          createFirebaseDocNotification(
            ENotificationType.PARTNER_SUB_ORDER_CHANGED,
            {
              userId: oldUserId,
              orderId: changeItem.orderId,
              companyName,
              subOrderDate: Number(changeItem.subOrderDate),
            },
          );
        }

        createFirebaseDocNotification(
          ENotificationType.PARTNER_SUB_ORDER_CHANGED,
          {
            userId,
            orderId: changeItem.orderId,
            companyName,
            subOrderDate: Number(changeItem.subOrderDate),
          },
        );
      } catch (error: any) {
        console.error('[ERROR] handleCreatePartnerNotification', error?.data);
      }
    },
  );
};

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const apiMethod = req.method;
    const {
      userRoles = [],
      emailParamsForParticipantNotification,
      emailParamsForBookerNotification,
      firebaseChangeHistory,
    } = req.body;
    const { currentUser } = req.previewData as any;

    switch (apiMethod) {
      case HttpMethod.POST: {
        const order = await fetchListing(
          emailParamsForBookerNotification.orderId,
        );

        const {
          startDate,
          endDate,
          companyName,
          plans = [],
        } = order.attributes.metadata || {};

        if (userRoles.includes('booker')) {
          emailSendingFactory(
            EmailTemplateTypes.BOOKER.BOOKER_PICKING_ORDER_CHANGED,
            emailParamsForBookerNotification,
          );
        }

        if (userRoles.includes('participant')) {
          emailParamsForParticipantNotification.forEach((params: TObject) =>
            emailSendingFactory(
              EmailTemplateTypes.PARTICIPANT.PARTICIPANT_PICKING_ORDER_CHANGED,
              params,
            ),
          );
        }

        createFirebaseDocNotification(ENotificationType.BOOKER_ORDER_CHANGED, {
          userId: CurrentUser(currentUser).getId(),
          orderId: emailParamsForBookerNotification.orderId,
          startDate,
          endDate,
        });

        if (!isEmpty(firebaseChangeHistory)) {
          await handleCreatePartnerNotification({
            plans,
            firebaseChangeHistory,
            companyName,
          });

          firebaseChangeHistory.forEach(
            async (data: Partial<TOrderChangeHistoryItem>) => {
              try {
                await orderServices.createOrderHistoryRecordToFirestore({
                  authorId: CurrentUser(currentUser).getId(),
                  ...data,
                } as TOrderChangeHistoryItem);
              } catch (error: any) {
                throw new Error(error);
              }
            },
          );
        }

        return res.status(200).json('Successfully notify user');
      }
      default:
        break;
    }
  } catch (error) {
    console.error(error);
    handleError(res, error);
  }
}

export default cookies(adminChecker(handler));
