import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import cookies from '@services/cookie';
import { fetchListing } from '@services/integrationHelper';
import partnerChecker from '@services/permissionChecker/partner';
import { handleError } from '@services/sdk';
import { EImageVariants } from '@src/utils/enums';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const apiMethod = req.method;

    switch (apiMethod) {
      case HttpMethod.GET: {
        const { foodId } = req.query;
        const food = await fetchListing(
          foodId as string,
          [],
          [`variants.${EImageVariants.squareSmall2x}`],
        );

        return res.status(200).json(food);
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
