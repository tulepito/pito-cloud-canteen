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
import { getSdk, handleError } from '@services/sdk';
import type { OrderListing, UserListing, WithFlexSDKData } from '@src/types';
import { buildFullName } from '@src/utils/emailTemplate/participantOrderPicking';
import { ENativeNotificationType } from '@src/utils/enums';
import type { TRestaurantRating } from '@src/utils/types';

export interface POSTCompanyRatingsBody {
  companyName: string;
  ratings: TRestaurantRating[];
  detailTextRating: string;
  imageIdList: string[];
  staff: { rating: number; optionalRating: string[] };
  service: { rating: number; optionalRating: string[] };
  imageUrlList: string[];
}

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
          imageUrlList,
        } = req.body as POSTCompanyRatingsBody;
        const sdk = getSdk(req, res);
        const currentUser: WithFlexSDKData<UserListing> =
          await sdk.currentUser.show();

        if (!ratings[0].orderId) {
          throw new Error('Order ID is required');
        }
        const orderListing: OrderListing = await fetchListing(
          ratings[0].orderId,
        );

        if (!orderListing.attributes?.title) {
          throw new Error('Order title is required');
        }

        await postRatingFn({
          companyName,
          ratings,
          ratingUserName: buildFullName(
            currentUser.data.data.attributes?.profile?.firstName,
            currentUser.data.data.attributes?.profile?.lastName,
            {
              compareToGetLongerWith:
                currentUser.data.data.attributes?.profile?.displayName,
            },
          ),
          orderCode: orderListing.attributes?.title,
          detailTextRating,
          generalRating: ratings[0].generalRating,
          imageUrlList,
        });
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
