import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import { pushNativeNotificationFood } from '@pages/api/helpers/pushNotificationOrderDetailHelper';
import cookies from '@services/cookie';
import { fetchListing } from '@services/integrationHelper';
import { getIntegrationSdk } from '@services/integrationSdk';
import { createFirebaseDocNotification } from '@services/notifications';
import adminChecker from '@services/permissionChecker/admin';
import { handleError } from '@services/sdk';
import {
  EFoodApprovalState,
  ENativeNotificationType,
  ENotificationType,
} from '@src/utils/enums';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const apiMethod = req.method;
    const integrationSdk = getIntegrationSdk();

    switch (apiMethod) {
      case HttpMethod.POST:
        {
          const { foodId, response } = req.body;
          await integrationSdk.listings.update({
            id: foodId,
            metadata: {
              adminApproval: response,
            },
          });
          if (
            response === EFoodApprovalState.ACCEPTED ||
            response === EFoodApprovalState.DECLINED
          ) {
            await pushNativeNotificationFood(
              foodId,
              response === EFoodApprovalState.ACCEPTED
                ? ENativeNotificationType.AdminTransitFoodStateToApprove
                : ENativeNotificationType.AdminTransitFoodStateToReject,
            );
          }

          const notificationType =
            response === EFoodApprovalState.ACCEPTED
              ? ENotificationType.PARTNER_FOOD_ACCEPTED_BY_ADMIN
              : ENotificationType.PARTNER_FOOD_REJECTED_BY_ADMIN;

          const food = await fetchListing(foodId, ['author']);
          const authorId = food.author.id.uuid;
          const foodName = food.attributes.title;

          createFirebaseDocNotification(notificationType, {
            userId: authorId,
            foodName,
            foodId,
          });
          res.json({ success: true });
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

export default cookies(adminChecker(handler));
