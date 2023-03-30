import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import {
  postRatingFn,
  updateRatingForOrderFn,
  updateRatingForRestaurantFn,
} from '@pages/api/apiServices/company/rating.service';
import cookies from '@services/cookie';
import { handleError } from '@services/sdk';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const apiMethod = req.method;
  switch (apiMethod) {
    case HttpMethod.POST:
      try {
        const { ratings, detailTextRating, imageIdList, staff, service } =
          req.body;
        await postRatingFn(ratings);
        await updateRatingForRestaurantFn(ratings);
        await updateRatingForOrderFn({
          ratings,
          detailTextRating,
          images: imageIdList,
          staff,
          service,
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
