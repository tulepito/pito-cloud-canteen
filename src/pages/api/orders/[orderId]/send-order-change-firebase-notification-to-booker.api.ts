import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import cookies from '@services/cookie';
import { fetchListing } from '@services/integrationHelper';
import { createFirebaseDocNotification } from '@services/notifications';
import adminChecker from '@services/permissionChecker/admin';
import { handleError } from '@services/sdk';
import { ENotificationType } from '@src/utils/enums';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const apiMethod = req.method;
    const { orderId = '' } = req.query;

    switch (apiMethod) {
      case HttpMethod.POST:
        {
          const order = await fetchListing(orderId as string);

          const { startDate, endDate, bookerId } =
            order.attributes.metadata || {};

          createFirebaseDocNotification(
            ENotificationType.BOOKER_ORDER_CHANGED,
            {
              userId: bookerId,
              orderId: orderId as string,
              startDate,
              endDate,
            },
          );
        }
        break;
      default:
        break;
    }

    return res.status(200).json('Successfully notify booker');
  } catch (error) {
    console.error(error);
    handleError(res, error);
  }
}

export default adminChecker(cookies(handler));
