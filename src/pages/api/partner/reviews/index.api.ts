import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import cookies from '@services/cookie';
import partnerChecker from '@services/permissionChecker/partner';
import { handleError } from '@services/sdk';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const apiMethod = req.method;

    switch (apiMethod) {
      case HttpMethod.GET: {
        // #TODO FAKE Data to Test

        const ratingDetail = [
          { rating: 1, total: 0 },
          { rating: 2, total: 100 },
          { rating: 3, total: 20 },
          { rating: 4, total: 8 },
          { rating: 5, total: 19 },
        ];

        const averageFoodRating = 4.2;
        const averagePackagingRating = 4.2;
        const averageTotalRating = 4.8;
        const totalNumberOfReivews = 800;
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
