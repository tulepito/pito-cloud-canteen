import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import { fetchListing } from '@services/integrationHelper';
import { getIntegrationSdk, handleError } from '@services/sdk';
import type { PlanListing } from '@src/types';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const apiMethod = req.method;
    const { planId } = req.query;
    const { subOrderTimestamp, deliveryPhoneNumber, checkList } = req.body;

    if (apiMethod !== HttpMethod.POST) {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    if (!planId || !subOrderTimestamp || !deliveryPhoneNumber || !checkList) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const integrationSdk = getIntegrationSdk();
    const planListing: PlanListing = await fetchListing(planId as string);

    const metadata = {
      deliveryInfo: {
        ...(planListing.attributes?.metadata?.deliveryInfo || {}),
        [subOrderTimestamp]: {
          ...(planListing.attributes?.metadata?.deliveryInfo?.[
            subOrderTimestamp
          ] || {}),
          [deliveryPhoneNumber]: {
            ...(planListing.attributes?.metadata?.deliveryInfo?.[
              subOrderTimestamp
            ]?.[deliveryPhoneNumber] || {}),
            checkList,
          },
        },
      },
    };

    await integrationSdk.listings.update({
      id: planId as string,
      metadata,
    });

    res.status(200).json({ message: 'Delivery info updated successfully' });
  } catch (error) {
    console.error(error);
    handleError(res, error);
  }
}

export default handler;
