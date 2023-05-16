import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import {
  postParticipantRatingFn,
  updateRatingForRestaurantFn,
} from '@pages/api/apiServices/company/rating.service';
import cookies from '@services/cookie';
import participantChecker from '@services/permissionChecker/participant';
import { handleError } from '@services/sdk';

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
