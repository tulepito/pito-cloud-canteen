import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import {
  postParticipantRatingFn,
  updateRatingForRestaurantFn,
} from '@pages/api/apiServices/company/rating.service';
import cookies from '@services/cookie';
import { fetchListing } from '@services/integrationHelper';
import { createNativeNotificationToPartner } from '@services/nativeNotification';
import { createFirebaseDocNotification } from '@services/notifications';
import participantChecker from '@services/permissionChecker/participant';
import { handleError } from '@services/sdk';
import { Listing } from '@src/utils/data';
import { ENativeNotificationType, ENotificationType } from '@src/utils/enums';

import { updateFirebaseDocument } from '../document/document.service';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const apiMethod = req.method;
  switch (apiMethod) {
    case HttpMethod.POST:
      try {
        const {
          companyName = 'PCC',
          rating,
          detailTextRating,
          imageIdList,
          planId,
        } = req.body;
        const { reviewerId, timestamp, generalRating, detailRating } = rating;
        const plan = await fetchListing(planId);
        const planListing = Listing(plan);
        const { orderDetail = {} } = planListing.getMetadata();
        const { foodId } =
          orderDetail[timestamp]?.memberOrders?.[reviewerId] || {};
        const food = await fetchListing(foodId, ['author']);
        const foodListing = Listing(food);
        const { title: foodName } = foodListing.getAttributes();

        const review = await postParticipantRatingFn({
          companyName,
          rating,
          detailTextRating,
          imageIdList,
          foodName,
          foodId,
        });

        await updateRatingForRestaurantFn([rating]);
        const subOrderId = `${reviewerId} - ${planId} - ${timestamp}`;
        await updateFirebaseDocument(subOrderId, {
          reviewId: review.id.uuid,
        });

        createFirebaseDocNotification(ENotificationType.ORDER_RATING, {
          userId: reviewerId,
          planId,
          subOrderDate: timestamp,
          foodName,
        });

        if (
          generalRating <= 2 ||
          (detailRating?.food.rating && detailRating?.food.rating <= 2) ||
          (detailRating?.packaging.rating &&
            detailRating?.packaging.rating <= 2)
        ) {
          createNativeNotificationToPartner(
            ENativeNotificationType.PartnerSubOrderNegativeRating,
            {
              partner: food.author,
              subOrderDate: timestamp,
            },
          );
        }
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
