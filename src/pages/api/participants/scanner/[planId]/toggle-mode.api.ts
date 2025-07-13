import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import { getIntegrationSdk } from '@services/sdk';
import type { PlanListing, WithFlexSDKData } from '@src/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === HttpMethod.PUT) {
    const { planId } = req.query;

    if (typeof planId !== 'string') {
      return res.status(400).json({ error: 'Invalid planId' });
    }

    const integrationSdk = await getIntegrationSdk();

    try {
      const planListingResponse: WithFlexSDKData<PlanListing> =
        await integrationSdk.listings.show({
          id: planId,
        });
      const planListing = planListingResponse.data.data;
      const currentAllowToQRCode =
        planListing.attributes?.metadata?.allowToQRCode;

      if (!planListing) {
        return res.status(404).json({ error: 'Plan not found' });
      }

      const orderDetail = planListing.attributes?.metadata?.orderDetail;
      if (!orderDetail) {
        return res.status(404).json({ error: 'Order detail not found' });
      }

      const updatedPlanListingResponse: WithFlexSDKData<PlanListing> =
        await integrationSdk.listings.update({
          id: planId,
          metadata: {
            allowToQRCode: !currentAllowToQRCode,
          },
        });

      res.status(200).json(updatedPlanListingResponse.data.data);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error occurred' });
    }

    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}
