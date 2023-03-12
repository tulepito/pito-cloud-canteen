import type { NextApiRequest, NextApiResponse } from 'next';

import cookies from '@services/cookie';
import adminChecker from '@services/permissionChecker/admin';
import { getIntegrationSdk, getSdk, handleError } from '@services/sdk';
import { denormalisedResponseEntities } from '@utils/data';
import {
  EListingStates,
  EListingType,
  ERestaurantListingStatus,
} from '@utils/enums';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const { userParams = {}, listingParams = {} } = req.body;

    const { userDataParams, userQueryParams } = userParams;
    const { listingDataParams, listingQueryParams } = listingParams;
    const sdk = getSdk(req, res);
    const integrationSdk = getIntegrationSdk();
    // Create company account
    const createdPartnerResponse = await sdk.currentUser.create(userDataParams);

    const [createdPartner] = denormalisedResponseEntities(
      createdPartnerResponse,
    );

    const restaurantListingResponse = await integrationSdk.listings.create(
      {
        ...listingDataParams,
        authorId: createdPartner?.id?.uuid,
        state: 'published',
        metadata: {
          listingState: EListingStates.draft,
          listingType: EListingType.restaurant,
          status: ERestaurantListingStatus.new,
        },
      },
      listingQueryParams,
    );

    const [restaurantListing] = denormalisedResponseEntities(
      restaurantListingResponse,
    );

    const updatedPartnerResponse = await integrationSdk.users.updateProfile(
      {
        id: createdPartner?.id?.uuid,
        metadata: {
          isPartner: true,
          restaurantListingId: restaurantListing?.id?.uuid,
          userState: 'draft',
        },
      },
      userQueryParams,
    );

    res.json({
      user: updatedPartnerResponse,
      listing: restaurantListingResponse,
    });
  } catch (error) {
    handleError(res, error);
  }
}

export default cookies(adminChecker(handler));
