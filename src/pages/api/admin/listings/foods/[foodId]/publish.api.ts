import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import { publishFood } from '@pages/api/apiServices/food/pubishFood.service';
import cookies from '@services/cookie';
import { handleError } from '@services/sdk';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const apiMethod = req.method;
    const { foodId } = req.query;
    console.log(
      `[API-${apiMethod}-REQUEST] : admin/listings/foods/${foodId}/publish.api.ts`,
    );
    switch (apiMethod) {
      case HttpMethod.POST: {
        const response = await publishFood(foodId as string, {
          expand: true,
        });

        return res.status(200).json(response);
      }
      case HttpMethod.GET:
      case HttpMethod.DELETE:
      case HttpMethod.PUT:
      default:
        return res.status(405).end(`Method ${apiMethod} Not Allowed`);
    }
  } catch (error) {
    console.error(
      `[API-ERROR]: admin/listings/foods/[foodId]/publish.api.ts`,
      error,
    );
    handleError(res, error);
  }
}

export default cookies(handler);
