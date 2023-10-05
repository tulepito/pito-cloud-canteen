import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import publishDraftMenu from '@pages/api/apiServices/menu/publishDraftMenu.service';
import cookies from '@services/cookie';
import { denormalisedResponseEntities } from '@services/data';
import { getIntegrationSdk } from '@services/integrationSdk';
import partnerChecker from '@services/permissionChecker/partner';
import { handleError } from '@services/sdk';
import { IntegrationListing } from '@src/utils/data';
import {
  EListingMenuStates,
  EListingStates,
  ERestaurantListingStatus,
} from '@src/utils/enums';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const apiMethod = req.method;
    const integrationSdk = getIntegrationSdk();

    const { dataParams = {}, queryParams = {} } = req.body;

    switch (apiMethod) {
      case HttpMethod.PUT: {
        const { id: menuId } = dataParams;
        const needPublishMenuIds = await publishDraftMenu(
          menuId,
          dataParams,
          queryParams,
        );
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

        await Promise.all(
          needPublishMenuIds.map(async (id: string) => {
            await integrationSdk.listings.update({
              id,
              publicData: {
                mealTypes: undefined,
              },
              metadata: {
                listingState: EListingStates.published,
              },
            });
          }),
        );

        return res.status(200).json({});
      }

      default:
        break;
    }
  } catch (error) {
    console.error(error);
    handleError(res, error);
  }
}

export default cookies(partnerChecker(handler));
