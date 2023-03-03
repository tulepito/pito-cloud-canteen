import type { NextApiRequest, NextApiResponse } from 'next';

import cookies from '@services/cookie';
import { getIntegrationSdk, handleError } from '@services/sdk';
import { denormalisedResponseEntities } from '@utils/data';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const { id } = req.body;
    const integrationSdk = getIntegrationSdk();
    // Create company account

    const updatedPartnerResponse = await integrationSdk.users.updateProfile(
      {
        id,
        metadata: {
          userState: 'published',
        },
      },
      {
        expand: true,
      },
    );

    const [updatedPartner] = denormalisedResponseEntities(
      updatedPartnerResponse,
    );

    const listingId =
      updatedPartner?.attributes?.profile?.metadata?.restaurantListingId;

    let restaurantListingResponse = null;
    if (listingId) {
      restaurantListingResponse = await integrationSdk.listings.update(
        {
          id: listingId,
          metadata: {
            listingState: 'published',
          },
        },
        { expand: true },
      );
    }

    res.json({
      user: updatedPartnerResponse,
      listing: restaurantListingResponse,
    });
  } catch (error) {
    handleError(res, error);
  }
}

export default cookies(handler);
