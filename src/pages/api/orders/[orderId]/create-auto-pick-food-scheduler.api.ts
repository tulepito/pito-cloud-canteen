import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import { createPickFoodForEmptyMembersScheduler } from '@services/awsEventBrigdeScheduler';
import cookies from '@services/cookie';
import { fetchListing } from '@services/integrationHelper';
import { getIntegrationSdk } from '@services/integrationSdk';
import { handleError } from '@services/sdk';
import { Listing } from '@src/utils/data';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const apiMethod = req.method;
    const integrationSdk = getIntegrationSdk();

    switch (apiMethod) {
      case HttpMethod.PUT:
        {
          const { orderId } = req.query;

          const order = await fetchListing(orderId as string);
          const orderListing = Listing(order);
          const { startDate, deliveryHour, bookerId } =
            orderListing.getMetadata();

          await createPickFoodForEmptyMembersScheduler({
            orderId: orderId as string,
            startDate,
            deliveryHour,
          });

          await integrationSdk.users.updateProfile({
            id: bookerId,
            publicData: {
              isAutoPickFood: true,
            },
          });
        }
        break;
      default:
        break;
    }
    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    handleError(res, error);
  }
}

export default cookies(handler);
