import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import cookies from '@services/cookie';
import { handleError } from '@services/sdk';

import {
  recommendRestaurantForSpecificDay,
  recommendRestaurants,
} from './recommendRestaurants.service';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const apiMethod = req.method;
    const { orderId, JSONParams } = req.query;
    const { timestamp } = JSON.parse(JSONParams as string);
    console.log(
      `[API-REQUEST]: ${apiMethod} api get restaurant recommendation for order: ${orderId} `,
    );
    switch (apiMethod) {
      case HttpMethod.GET: {
        if (!orderId) throw new Error('orderId is required');

        if (!!timestamp && Number.isNaN(Number(timestamp)))
          throw new Error('timestamp is invalid');

        const recommendation = timestamp
          ? await recommendRestaurantForSpecificDay(
              String(orderId),
              Number(timestamp),
            )
          : await recommendRestaurants(String(orderId));

        return res.status(200).json(recommendation);
      }
      case HttpMethod.POST:
      case HttpMethod.DELETE:
      case HttpMethod.PUT:
      default:
        return res.status(405).end(`Method ${apiMethod} Not Allowed`);
    }
  } catch (error) {
    console.error(error);
    handleError(res, error);
  }
}

export default cookies(handler);
