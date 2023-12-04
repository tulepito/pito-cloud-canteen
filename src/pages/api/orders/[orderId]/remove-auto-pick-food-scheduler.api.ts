import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import {
  createPickFoodForEmptyMembersScheduler,
  getScheduler,
} from '@services/awsEventBrigdeScheduler';
import cookies from '@services/cookie';
import { fetchListing } from '@services/integrationHelper';
import { getIntegrationSdk, handleError } from '@services/sdk';
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
          const schedulerName = `PFFEM_${orderId}`;
          try {
            await getScheduler(schedulerName);
          } catch (error) {
            console.info(
              `Scheduler ${schedulerName} not found, so no need to delete it`,
            );

            return res.status(200).json({ success: true });
          }
          await createPickFoodForEmptyMembersScheduler({
            orderId,
            startDate,
            deliveryHour,
          });

          await integrationSdk.users.updateProfile({
            id: bookerId,
            publicData: {
              isAutoPickFood: false,
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
