import cookies from '@services/cookie';
import adminChecker from '@services/permissionChecker/admin';
import { getIntegrationSdk, handleError } from '@services/sdk';
import { denormalisedResponseEntities } from '@utils/data';
import type { NextApiRequest, NextApiResponse } from 'next';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
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

export default cookies(adminChecker(handler));
