import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import { pushNativeNotificationFood } from '@pages/api/helpers/pushNotificationOrderDetailHelper';
import cookies from '@services/cookie';
import { getIntegrationSdk } from '@services/integrationSdk';
import adminChecker from '@services/permissionChecker/admin';
import { handleError } from '@services/sdk';
import { EFoodApprovalState, ENativeNotificationType } from '@src/utils/enums';

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
