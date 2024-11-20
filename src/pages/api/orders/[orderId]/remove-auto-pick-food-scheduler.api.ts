import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import {
  getScheduler,
  upsertPickFoodForEmptyMembersScheduler,
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
          const { bookerId, deadlineDate } = orderListing.getMetadata();

          const updateOrderPromise = integrationSdk.listings.update({
            id: orderId as string,
            metadata: {
              isAutoPickFood: false,
            },
          });
          const updateBookerPromise = integrationSdk.users.updateProfile({
            id: bookerId,
            publicData: {
              isAutoPickFood: false,
            },
          });
          await Promise.all([updateOrderPromise, updateBookerPromise]);

          const schedulerName = `PFFEM_${orderId}`;
          try {
            await getScheduler(schedulerName);
          } catch (error) {
            console.info(
              `Scheduler ${schedulerName} not found, so no need to delete it`,
            );

            return res.status(200).json({ success: true });
          }
          await upsertPickFoodForEmptyMembersScheduler({
            orderId: String(orderId),
            deadlineDate,
            params: {
              orderId: null,
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
