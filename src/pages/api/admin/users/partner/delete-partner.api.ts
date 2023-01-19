// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import cookies from '@services/cookie';
import { deserialize, getIntegrationSdk, handleError } from '@services/sdk';
import { denormalisedResponseEntities } from '@utils/data';
import { ERestaurantListingState } from '@utils/enums';
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
    const { id } = req.body;

    const integrationSdk = getIntegrationSdk();
    // Create company account

    const updatedPartnerResponse = await integrationSdk.users.updateProfile(
      {
        id,
        metadata: {
          userState: 'deleted',
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
      await integrationSdk.listings.close({
        id: listingId,
      });

      restaurantListingResponse = await integrationSdk.listings.update(
        {
          id: listingId,
          metadata: {
            listingState: ERestaurantListingState.deleted,
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
