import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import { denormalisedResponseEntities } from '@services/data';
import { getIntegrationSdk } from '@services/integrationSdk';
import { handleError } from '@services/sdk';
import { IntegrationListing } from '@src/utils/data';
import {
  EListingMenuStates,
  EListingStates,
  EMenuStatus,
  ERestaurantListingStatus,
} from '@src/utils/enums';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const apiMethod = req.method;
    const integrationSdk = getIntegrationSdk();
    switch (apiMethod) {
      case HttpMethod.POST: {
        const { menuId } = req.query;

        const menuResponse = await integrationSdk.listings.show({
          id: menuId,
        });

        const [menu] = denormalisedResponseEntities(menuResponse);

        const { restaurantId } = IntegrationListing(menu).getMetadata();

        const restaurantResponse = await integrationSdk.listings.show({
          id: restaurantId,
        });

        const [restaurant] = denormalisedResponseEntities(restaurantResponse);

        const { status } = IntegrationListing(restaurant).getMetadata();

        if (status !== ERestaurantListingStatus.authorized) {
          await integrationSdk.listings.update({
            id: menuId,
            metadata: {
              listingState: EListingMenuStates.pendingRestaurantApproval,
            },
          });

          return res.json({
            message: 'Restaurant is not authorized. Menu will not be published',
          });
        }

        const response = await integrationSdk.listings.update(
          {
            id: menuId,
            metadata: {
              menuStatus: EMenuStatus.approved,
              listingState: EListingStates.published,
            },
          },
          {
            expand: true,
          },
        );

        return res.status(200).json(response);
      }
      default: {
        return res.status(500).json({ message: 'Method is not allowed' });
      }
    }
  } catch (error) {
    console.error(error);
    handleError(res, error);
  }
}

export default handler;
