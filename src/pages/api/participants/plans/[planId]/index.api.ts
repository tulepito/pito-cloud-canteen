/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import type { NextApiRequest, NextApiResponse } from 'next';

import { HTTP_METHODS } from '@pages/api/helpers/constants';
import cookies from '@services/cookie';
import { getIntegrationSdk, getSdk, handleError } from '@services/sdk';
import {
  CurrentUser,
  denormalisedResponseEntities,
  Listing,
} from '@utils/data';

const fetchSubOrder = async (orderDetail: any, currentUserId: string) => {
  let orderDetailResult = {};
  const integrationSdk = getIntegrationSdk();
  const planKeys = Object.keys(orderDetail);

  for (const planKey of planKeys) {
    const planItem = orderDetail[planKey];
    const { restaurant = {}, memberOrders = {} } = planItem;
    const { foodList = {}, id: restaurantId } = restaurant;

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
          const currentUser = denormalisedResponseEntities(
            await sdk.currentUser.show(),
          )[0];

          const plan = denormalisedResponseEntities(
            await integrationSdk.listings.show({
              id: planId,
            }),
          )[0];
          const { orderId, orderDetail } = Listing(plan).getMetadata();
          const order = denormalisedResponseEntities(
            await integrationSdk.listings.show({
              id: orderId,
            }),
          )[0];

          const currentUserId = CurrentUser(currentUser).getId();
          const mealPlan = await fetchSubOrder(orderDetail, currentUserId);
          res.json({
            statusCode: 200,
            meta: {},
            data: {
              plan: mealPlan,
              order,
            },
          });
        } catch (error: any) {
          console.error(error?.data?.errors);
          handleError(res, error);
        }
      }
      break;
    default:
      break;
  }
};

export default cookies(handler);
