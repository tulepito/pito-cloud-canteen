import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import {
  postRatingFn,
  updateRatingForOrderFn,
  updateRatingForRestaurantFn,
} from '@pages/api/apiServices/company/rating.service';
import cookies from '@services/cookie';
import { fetchListing } from '@services/integrationHelper';
import { createNativeNotificationToPartner } from '@services/nativeNotification';
import { handleError } from '@services/sdk';
import { ENativeNotificationType } from '@src/utils/enums';
import type { TRestaurantRating } from '@src/utils/types';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const apiMethod = req.method;
  switch (apiMethod) {
    case HttpMethod.POST:
      try {
        const {
          companyName,
          ratings,
          detailTextRating,
          imageIdList,
          staff,
          service,
        } = req.body;
        await postRatingFn({ companyName, ratings });
        await updateRatingForRestaurantFn(ratings);
        await updateRatingForOrderFn({
          ratings,
          detailTextRating,
          images: imageIdList,
          staff,
          service,
        });

        ratings.forEach(async (rating: TRestaurantRating) => {
          const {
            timestamp,
            generalRating,
            detailRating = {},
            restaurantId,
          } = rating;

          const restaurant = await fetchListing(restaurantId, ['author']);
          const author = restaurant?.author;

          if (
            generalRating <= 2 ||
            (detailRating?.food?.rating && detailRating?.food?.rating <= 2) ||
            (detailRating?.packaging?.rating &&
              detailRating?.packaging?.rating <= 2)
          ) {
            createNativeNotificationToPartner(
              ENativeNotificationType.PartnerSubOrderNegativeRating,
              {
                partner: author,
                subOrderDate: `${timestamp}`,
              },
            );
          }
        });

        res.status(200).json({ success: true });
      } catch (error) {
        handleError(res, error);
      }

      break;

    default:
      break;
  }
}

export default cookies(handler);
