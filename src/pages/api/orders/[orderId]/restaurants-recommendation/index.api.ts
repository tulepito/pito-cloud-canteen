import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import cookies from '@services/cookie';
import { denormalisedResponseEntities } from '@services/data';
import { getSdk, handleError } from '@services/sdk';
import { CurrentUser } from '@src/utils/data';

import {
  recommendRestaurantForSpecificDay,
  recommendRestaurants,
} from './recommendRestaurants.service';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const apiMethod = req.method;
    const { orderId, JSONParams } = req.query;
    const { timestamp, recommendParams = {} } = JSON.parse(
      JSONParams as string,
    );
    const sdk = getSdk(req, res);
    const [currentUser] = denormalisedResponseEntities(
      await sdk.currentUser.show(),
    );
    const { isAdmin = false } = CurrentUser(currentUser).getMetadata();

    console.log(
      `[API-REQUEST]: ${apiMethod} api get restaurant recommendation for order: ${orderId} `,
    );
    switch (apiMethod) {
      case HttpMethod.GET: {
        if (!orderId) throw new Error('orderId is required');

        if (!!timestamp && Number.isNaN(Number(timestamp)))
          throw new Error('timestamp is invalid');

        const recommendation = timestamp
          ? await recommendRestaurantForSpecificDay({
              orderId: String(orderId),
              timestamp: Number(timestamp),
              shouldCalculateDistance: !isAdmin,
              recommendParams,
            })
          : await recommendRestaurants({
              orderId: String(orderId),
              shouldCalculateDistance: !isAdmin,
              recommendParams,
            });

        return res.status(200).json(recommendation);
      }

      default:
        return res.status(405).end(`Method ${apiMethod} Not Allowed`);
    }
  } catch (error) {
    console.error(error);
    handleError(res, error);
  }
}

export default cookies(handler);
