import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import { fetchListing } from '@services/integrationHelper';
import { getIntegrationSdk, handleError } from '@services/sdk';
import { Listing } from '@src/utils/data';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const apiMethod = req.method;
    const { orderId } = req.query;
    const { subOrderTimestamp, deliveryPhoneNumber, checkList } = req.body;

    if (apiMethod !== HttpMethod.POST) {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    if (!orderId || !subOrderTimestamp || !deliveryPhoneNumber || !checkList) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const integrationSdk = getIntegrationSdk();
    const order = await fetchListing(orderId as string);
    const orderListing = Listing(order);

    const { deliveryInfo = {} } = orderListing.getMetadata();

    const updatedDeliveryInfo = {
      ...deliveryInfo,
      [subOrderTimestamp]: {
        ...(deliveryInfo[subOrderTimestamp] || {}),
        [deliveryPhoneNumber]: { checkList },
      },
    };

    const planId = orderListing.getMetadata().plans?.[0];

    await integrationSdk.listings.update({
      id: planId as string,
      metadata: {
        deliveryInfo: updatedDeliveryInfo,
      },
    });

    res.status(200).json({ message: 'Delivery info updated successfully' });
  } catch (error) {
    console.error(error);
    handleError(res, error);
  }
}

export default handler;
