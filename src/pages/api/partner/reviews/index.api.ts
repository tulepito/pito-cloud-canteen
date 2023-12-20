import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import cookies from '@services/cookie';
import { fetchListing } from '@services/integrationHelper';
import partnerChecker from '@services/permissionChecker/partner';
import { getSdk, handleError } from '@services/sdk';
import {
  CurrentUser,
  denormalisedResponseEntities,
  Listing,
} from '@src/utils/data';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const apiMethod = req.method;
    const sdk = getSdk(req, res);

    switch (apiMethod) {
      case HttpMethod.GET: {
        const currentUserRes = await sdk.currentUser.show();
        const [companyAccount] = denormalisedResponseEntities(currentUserRes);
        const { restaurantListingId: restaurantId } =
          CurrentUser(companyAccount).getMetadata();
        const restaurant = await fetchListing(restaurantId as string);
        const {
          totalRatingNumber: totalNumberOfReivews,
          totalRating: averageTotalRating,
          detailRating,
        } = Listing(restaurant).getMetadata();
        const { food: averageFoodRating, packaging: averagePackagingRating } =
          detailRating ?? {};

        // #TODO FAKE Data to Test
        const ratingDetail = [
          { rating: 1, total: 0 },
          { rating: 2, total: 100 },
          { rating: 3, total: 20 },
          { rating: 4, total: 8 },
          { rating: 5, total: 19 },
        ];
        // #END TODO FAKE Data to Test

        return res.status(200).json({
          ratingDetail,
          averageFoodRating,
          averagePackagingRating,
          averageTotalRating,
          totalNumberOfReivews,
        });
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
