import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import cookies from '@services/cookie';
import adminChecker from '@services/permissionChecker/admin';
import { getIntegrationSdk } from '@services/sdk';
import type { PlanListing, WithFlexSDKData } from '@src/types';

export interface POSTDeliveryAgentsMealsBody {
  timestamp: string;
  numberOfMeals: number;
  restaurantId?: string;
  restaurantName?: string;
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === HttpMethod.POST) {
    const { planId } = req.query;

    if (typeof planId !== 'string') {
      return res.status(400).json({ error: 'Invalid planId' });
    }

    const integrationSdk = await getIntegrationSdk();

    try {
      const planListingResponse: WithFlexSDKData<PlanListing> =
        await integrationSdk.listings.show({ id: planId });
      const plan = planListingResponse.data.data;
      const _deliveryAgentsMeals = {
        [req.body.timestamp]: {
          numberOfMeals: req.body.numberOfMeals,
          restaurantId: req.body.restaurantId,
          restaurantName: req.body.restaurantName,
        },
      };
      const updatedDeliveryAgentsMeals = {
        ...plan.attributes?.metadata?.deliveryAgentsMeals,
        ..._deliveryAgentsMeals,
      };

      const updatedPlanLisitngResponse: WithFlexSDKData<PlanListing> =
        await integrationSdk.listings.update({
          id: planId,
          metadata: {
            deliveryAgentsMeals: updatedDeliveryAgentsMeals,
          },
        });

      res.status(200).json(updatedPlanLisitngResponse.data.data);
    } catch (error) {
      console.log('error:', error);
      res
        .status(500)
        .json({ error: `Internal server error occurred ${error}` });
    }

    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}

export default cookies(adminChecker(handler));
