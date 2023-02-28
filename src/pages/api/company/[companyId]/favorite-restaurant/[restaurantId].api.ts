// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import cookies from '@services/cookie';
import { fetchListing, fetchUser } from '@services/integrationHelper';
import { getIntegrationSdk } from '@services/integrationSdk';
import companyChecker from '@services/permissionChecker/company';
import { handleError } from '@services/sdk';
import { Listing, User } from '@utils/data';
import type { NextApiRequest, NextApiResponse } from 'next';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const { companyId, restaurantId } = req.body;
  const integrationSdk = getIntegrationSdk();
  try {
    const companyAccount = await fetchUser(companyId);
    const restaurant = await fetchListing(restaurantId);
    const { favoriteRestaurantList = [] } =
      User(companyAccount).getPublicData();
    const { favoriteCounter = 0 } = Listing(restaurant).getMetadata();

    await integrationSdk.users.updateProfile({
      id: companyId,
      publicData: {
        favoriteRestaurantList: Array.from(
          new Set(favoriteRestaurantList).add(restaurantId),
        ),
      },
    });

    await integrationSdk.listings.update({
      id: restaurantId,
      metadata: {
        favoriteCounter: favoriteCounter + 1,
      },
    });
    res.status(200).json({});
  } catch (error) {
    handleError(res, error);
  }
}

export default cookies(companyChecker(handler));
