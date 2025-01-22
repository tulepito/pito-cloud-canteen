import {
  recommendRestaurantForSpecificDay,
  recommendRestaurants,
} from '@apiServices/order/recommendRestaurants/index.services';
import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import cookies from '@services/cookie';
import { denormalisedResponseEntities } from '@services/data';
import { getSdk, handleError } from '@services/sdk';
import { CurrentUser } from '@src/utils/data';
import type { TObject } from '@src/utils/types';

export interface GETRestaurantsRecommendationJSONParams {
  timestamp?: number;
  recommendParams: TObject;
}

export interface GETRestaurantsRecommendationQuery {
  orderId: string;
  JSONParams: string;
}

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const apiMethod = req.method;
    const { orderId, JSONParams } =
      req.query as unknown as GETRestaurantsRecommendationQuery;
    const { timestamp, recommendParams = {} } = JSON.parse(
      JSONParams as string,
    ) as GETRestaurantsRecommendationJSONParams;

    const sdk = getSdk(req, res);
    const [currentUser] = denormalisedResponseEntities(
      await sdk.currentUser.show(),
    );
    const { isAdmin = false } = CurrentUser(currentUser).getMetadata();

    switch (apiMethod) {
      case HttpMethod.GET: {
        if (!orderId) throw new Error('orderId is required');

        if (!!timestamp && Number.isNaN(Number(timestamp)))
          throw new Error('timestamp is invalid');

        const recommendations = timestamp
          ? await recommendRestaurantForSpecificDay({
              orderId,
              timestamp,
              shouldCalculateDistance: !isAdmin,
              recommendParams,
            })
          : await recommendRestaurants({
              orderId,
              shouldCalculateDistance: !isAdmin,
              recommendParams,
            });

        return res.status(200).json(recommendations);
      }

      default:
        return res.status(405).end(`Method ${apiMethod} Not Allowed`);
    }
  } catch (error) {
    handleError(res, error);
  }
}

export default cookies(handler);
