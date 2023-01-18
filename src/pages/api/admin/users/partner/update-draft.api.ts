// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import cookies from '@services/cookie';
import { deserialize, getIntegrationSdk, handleError } from '@services/sdk';
import { denormalisedResponseEntities } from '@utils/data';
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

    const integrationSdk = getIntegrationSdk();
    // Create company account

    const updatedPartnerResponse = await integrationSdk.users.update(
      userDataParams,
      userQueryParams,
    );

    const [updatedPartner] = denormalisedResponseEntities(
      updatedPartnerResponse,
    );

    const restaurantListingResponse = await integrationSdk.listings.update(
      {
        ...listingDataParams,
        authorId: updatedPartner?.id?.uuid,
      },
      listingQueryParams,
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
