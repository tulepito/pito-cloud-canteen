import type { NextApiRequest, NextApiResponse } from 'next';

import cookies from '@services/cookie';
import { createFirebaseDocNotification } from '@services/notifications';
import adminChecker from '@services/permissionChecker/admin';
import { getIntegrationSdk, handleError } from '@services/sdk';
import { ENotificationType } from '@src/utils/enums';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const { dataParams, queryParams = {} } = req.body;
    const integrationSdk = getIntegrationSdk();
    const response = await integrationSdk.listings.update(
      dataParams,
      queryParams,
    );

    createFirebaseDocNotification(
      ENotificationType.PARTNER_PROFILE_UPDATED_BY_ADMIN,
      {
        userId: dataParams.id,
        partnerName: dataParams.publicData.companyName,
      },
    );
    res.json(response);
  } catch (error) {
    console.error(error);
    handleError(res, error);
  }
}

export default cookies(adminChecker(handler));
