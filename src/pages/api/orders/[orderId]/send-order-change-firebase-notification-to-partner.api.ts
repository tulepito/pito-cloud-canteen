import isEmpty from 'lodash/isEmpty';
import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import cookies from '@services/cookie';
import { fetchListing } from '@services/integrationHelper';
import { createFirebaseDocNotification } from '@services/notifications';
import adminChecker from '@services/permissionChecker/admin';
import { handleError } from '@services/sdk';
import { ENotificationType } from '@src/utils/enums';
import type { TObject, TOrderChangeHistoryItem } from '@src/utils/types';

const handleCreatePartnerNotification = async ({
  plans,
  firebaseChangeHistory,
  companyName,
  orderTitle,
}: {
  plans: string[];
  firebaseChangeHistory: TOrderChangeHistoryItem[];
  companyName: string;
  orderTitle: string;
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
              orderTitle,
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
            orderTitle,
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
    const { orderId = '' } = req.query;
    const { firebaseChangeHistory } = req.body;

    switch (apiMethod) {
      case HttpMethod.POST:
        {
          const order = await fetchListing(orderId as string);
          const { title: orderTitle } = order.attributes || {};
          const { companyName, plans = [] } = order.attributes.metadata || {};

          if (!isEmpty(firebaseChangeHistory)) {
            await handleCreatePartnerNotification({
              plans,
              firebaseChangeHistory,
              companyName,
              orderTitle,
            });
          }
        }
        break;
      default:
        break;
    }

    return res.status(200).json('Successfully notify partner');
  } catch (error) {
    console.error(error);
    handleError(res, error);
  }
}

export default adminChecker(cookies(handler));
