import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import { queryAllListings } from '@helpers/apiHelpers';
import cookies from '@services/cookie';
import { fetchListing } from '@services/integrationHelper';
import partnerChecker from '@services/permissionChecker/partner';
import { getSdk, handleError } from '@services/sdk';
import {
  CurrentUser,
  denormalisedResponseEntities,
  Listing,
} from '@src/utils/data';
import { EListingType } from '@src/utils/enums';
import type { TListing } from '@src/utils/types';

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

        const query = {
          meta_listingType: EListingType.rating,
          meta_restaurantId: restaurantId,
        };
        const reviews = await queryAllListings({
          query,
        });
        const mapRatingDetail = new Map<number, number>([
          [1, 0],
          [2, 0],
          [3, 0],
          [4, 0],
          [5, 0],
        ]);

        reviews.forEach((review: TListing) => {
          const { generalRating: rating } = Listing(review).getMetadata();
          const ratingTotal: number = (mapRatingDetail.get(rating) ?? 0) + 1;
          mapRatingDetail.set(rating, ratingTotal);
        });

        return res.status(200).json({
          ratingDetail: Array.from(mapRatingDetail.keys()).map((key) => ({
            rating: key,
            total: mapRatingDetail.get(key),
          })),
          averageFoodRating: averageFoodRating ?? 0,
          averagePackagingRating: averagePackagingRating ?? 0,
          averageTotalRating: averageTotalRating ?? 0,
          totalNumberOfReivews: totalNumberOfReivews ?? 0,
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
