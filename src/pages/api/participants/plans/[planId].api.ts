/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import cookies from '@services/cookie';
import {
  CURRENT_USER,
  denormalisedResponseEntities,
  LISTING,
} from '@utils/data';
import type { NextApiRequest, NextApiResponse } from 'next';

import { getIntegrationSdk } from '../../../../services/integrationSdk';
import { getSdk, handleError } from '../../../../services/sdk';
import { HTTP_METHODS } from '../../helpers/constants';

const fetchSubOrder = async (orderDetail: any, currentUserId: string) => {
  let orderDetailResult = {};
  const integrationSdk = getIntegrationSdk();
  const planKeys = Object.keys(orderDetail);

  for (const planKey of planKeys) {
    const planItem = orderDetail[planKey];
    const { foodList, restaurant, memberOrders } = planItem;
    const restaurantId = restaurant?.id;

    // Fetch restaurant data
    const restaurantData = denormalisedResponseEntities(
      await integrationSdk.listings.show({
        id: restaurantId,
        include: ['images'],
        'fields.image': [
          'variants.landscape-crop',
          'variants.landscape-crop2x',
          'variants.landscape-crop4x',
          'variants.landscape-crop6x',
        ],
        expand: true,
      }),
    )[0];

    // Fetch food listings data
    const foodListIds = Object.keys(foodList);
    const foodListData = denormalisedResponseEntities(
      await integrationSdk.listings.query({
        ids: foodListIds.join(','),
        meta_listingType: 'food',
      }),
    );

    orderDetailResult = {
      ...orderDetailResult,
      [planKey]: {
        foodList: foodListData,
        restaurant: restaurantData,
        memberOrder: { [currentUserId]: memberOrders[currentUserId] },
      },
    };
  }
  return orderDetailResult;
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const apiMethod = req.method;
  const integrationSdk = getIntegrationSdk();
  const sdk = getSdk(req, res);

  switch (apiMethod) {
    case HTTP_METHODS.GET:
      {
        const { planId } = req.query;

        if (!planId) {
          return res.status(400).json({
            message: 'Missing required keys',
          });
        }

        try {
          const plan = denormalisedResponseEntities(
            await integrationSdk.listings.show({
              id: planId,
            }),
          )[0];
          const { orderId, orderDetail } = LISTING(plan).getMetadata();
          const order = denormalisedResponseEntities(
            await integrationSdk.listings.show({
              id: orderId,
            }),
          )[0];

          const currentUser = denormalisedResponseEntities(
            await sdk.currentUser.show(),
          )[0];
          const currentUserId = CURRENT_USER(currentUser).getId();

          const mealPlan = await fetchSubOrder(orderDetail, currentUserId);
          res.json({
            statusCode: 200,
            meta: {},
            data: {
              plan: mealPlan,
              order,
            },
          });
        } catch (error) {
          handleError(res, error);
          console.log(error);
        }
      }
      break;
    default:
      break;
  }
};

export default cookies(handler);
