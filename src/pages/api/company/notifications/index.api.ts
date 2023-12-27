import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import cookies from '@services/cookie';
import { fetchFirebaseDocNotifications } from '@services/notifications';
import companyChecker from '@services/permissionChecker/company';
import { handleError } from '@services/sdk';
import { ENotificationType } from '@src/utils/enums';

const bookerNotificationTypes = [
  ENotificationType.BOOKER_NEW_ORDER_CREATED,
  ENotificationType.BOOKER_SUB_ORDER_COMPLETED,
  ENotificationType.BOOKER_SUB_ORDER_CANCELLED,
  ENotificationType.BOOKER_ORDER_CHANGED,
  ENotificationType.BOOKER_RATE_ORDER,
  ENotificationType.BOOKER_PICKING_ORDER,
];

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const apiMethod = req.method;
    const { currentUser } = req.previewData as any;

    switch (apiMethod) {
      case HttpMethod.GET: {
        const notificationsResponse =
          (await fetchFirebaseDocNotifications(currentUser.id.uuid)) || [];

        const filteredBookerNotifications = notificationsResponse.filter(
          (notification) => {
            const { notificationType } = notification;

            return bookerNotificationTypes.includes(notificationType);
          },
        );

        res.json(filteredBookerNotifications);
        break;
      }
      case HttpMethod.POST:
        break;
      default:
        break;
    }
  } catch (error) {
    console.error(error);
    handleError(res, error);
  }
}

export default cookies(companyChecker(handler));
