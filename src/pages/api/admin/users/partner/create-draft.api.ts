/* eslint-disable no-console */
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import cookies from '@services/cookie';
import {
  deserialize,
  getIntegrationSdk,
  getSdk,
  handleError,
} from '@services/sdk';
import { denormalisedResponseEntities } from '@utils/data';
import {
  EListingStates,
  EListingType,
  ERestaurantListingStatus,
} from '@utils/enums';
import type { NextApiRequest, NextApiResponse } from 'next';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    if (
      req.headers['content-type'] === 'application/transit+json' &&
      typeof req.body === 'string'
    ) {
      try {
        req.body = deserialize(req.body);
      } catch (e) {
        console.error('Failed to parse request body as Transit:');
        console.error(e);
        res.status(400).send('Invalid Transit in request body.');
        return;
      }
    }

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

export default cookies(handler);
