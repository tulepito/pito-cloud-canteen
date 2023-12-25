import type { NextApiRequest, NextApiResponse } from 'next';

import cookies from '@services/cookie';
import { fetchListing } from '@services/integrationHelper';
import { createNativeNotificationToPartner } from '@services/nativeNotification';
import adminChecker from '@services/permissionChecker/admin';
import { getIntegrationSdk, handleError } from '@services/sdk';
import { ENativeNotificationType } from '@src/utils/enums';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const { dataParams, queryParams = {} } = req.body;
    const integrationSdk = getIntegrationSdk();
    const response = await integrationSdk.listings.update(
      dataParams,
      queryParams,
    );

    const restaurant = await fetchListing(dataParams.id, ['author']);
    const author = restaurant?.author;
    const { title: partnerName } = restaurant.attributes || {};
    createNativeNotificationToPartner(
      ENativeNotificationType.AdminChangePartnerInformation,
      {
        partner: author,
        partnerName,
      },
    );
    res.json(response);
  } catch (error) {
    console.error(error);
    handleError(res, error);
  }
}

export default cookies(adminChecker(handler));
