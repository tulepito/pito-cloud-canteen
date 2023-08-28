import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import { queryAllPages } from '@helpers/apiHelpers';
import cookies from '@services/cookie';
import { getIntegrationSdk } from '@services/integrationSdk';
import { handleError } from '@services/sdk';
import { Listing } from '@src/utils/data';
import { EListingStates, EListingType } from '@src/utils/enums';
import type { TListing } from '@src/utils/types';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const {
      method: apiMethod,
      query: { partnerId },
      body: { isActive = true },
    } = req;

    const integrationSdk = getIntegrationSdk();

    switch (apiMethod) {
      case HttpMethod.PUT: {
        const allMenus = await queryAllPages({
          sdkModel: integrationSdk.listings,
          query: {
            meta_listingType: EListingType.menu,
            meta_restaurantId: partnerId,
            meta_isDeleted: false,
            meta_listingState: isActive
              ? EListingStates.published
              : EListingStates.closed,
          },
        });
        await Promise.all(
          allMenus.map(async (menu: TListing) => {
            const menuId = Listing(menu).getId();

            await integrationSdk.listings.update({
              id: menuId,
              metadata: {
                listingState: isActive
                  ? EListingStates.closed
                  : EListingStates.published,
              },
            });
          }),
        );

        return res.status(200).json('Successfully toggle app status');
      }
      default:
        break;
    }
  } catch (error) {
    console.error(error);
    handleError(res, error);
  }
}

export default cookies(handler);
