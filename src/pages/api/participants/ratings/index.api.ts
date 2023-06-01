import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import {
  postParticipantRatingFn,
  updateRatingForRestaurantFn,
} from '@pages/api/apiServices/company/rating.service';
import cookies from '@services/cookie';
import { fetchListing } from '@services/integrationHelper';
import { createFirebaseDocNotification } from '@services/notifications';
import participantChecker from '@services/permissionChecker/participant';
import { handleError } from '@services/sdk';
import { Listing } from '@src/utils/data';
import { ENotificationType } from '@src/utils/enums';

import { updateFirebaseDocument } from '../document/document.service';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const apiMethod = req.method;
  switch (apiMethod) {
    case HttpMethod.POST:
      try {
        const { rating, detailTextRating, imageIdList, planId } = req.body;
        const { reviewerId, timestamp } = rating;
        const review = await postParticipantRatingFn({
          rating,
          detailTextRating,
          imageIdList,
        });

        await updateRatingForRestaurantFn([rating]);
        const subOrderId = `${reviewerId} - ${planId} - ${timestamp}`;
        await updateFirebaseDocument(subOrderId, {
          reviewId: review.id.uuid,
        });

        const plan = await fetchListing(planId);
        const planListing = Listing(plan);
        const { orderDetail } = planListing.getMetadata();
        const { foodId } = orderDetail[timestamp].memberOrders[reviewerId];
        const food = await fetchListing(foodId);
        const foodListing = Listing(food);
        const { title: foodName } = foodListing.getAttributes();
        createFirebaseDocNotification(ENotificationType.ORDER_RATING, {
          userId: reviewerId,
          planId,
          subOrderDate: timestamp,
          foodName,
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

export default cookies(participantChecker(handler));
