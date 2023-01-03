/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import { denormalisedResponseEntities, LISTING } from '@utils/data';
import type { NextApiRequest, NextApiResponse } from 'next';

import { getIntegrationSdk } from '../../../../services/integrationSdk';
import { handleError } from '../../../../services/sdk';
import { HTTP_METHODS } from '../../helpers/constants';

const fetchSubOrder = async (orderDetail: any) => {
  let orderDetailResult = {};
  const integrationSdk = getIntegrationSdk();
  const planKeys = Object.keys(orderDetail);
  for (const planKey of planKeys) {
    const planItem = orderDetail[planKey];
    const { foodList, restaurant: restaurantId } = planItem;
    const restaurant = denormalisedResponseEntities(
      await integrationSdk.listings.show({ id: restaurantId }),
    )[0];
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
        restaurant,
      },
    };
  }

  return orderDetailResult;
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const apiMethod = req.method;
  const integrationSdk = getIntegrationSdk();

  switch (apiMethod) {
    case HTTP_METHODS.GET:
      {
        const { planId } = req.query;
        console.log({ planId });

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
          const mealPlan = await fetchSubOrder(orderDetail);
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

export default handler;
