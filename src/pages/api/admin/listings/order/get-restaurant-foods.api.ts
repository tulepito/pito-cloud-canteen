import { chunk, flatten } from 'lodash';
import { DateTime } from 'luxon';
import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import { queryAllFoodIdList, queryAllPages } from '@helpers/apiHelpers';
import { getMenuQuery, getRestaurantQuery } from '@helpers/listingSearchQuery';
import {
  filterRestaurant,
  parseFoodsFromMenu,
} from '@helpers/searchRestaurantHelper';
import cookies from '@services/cookie';
import { fetchListing } from '@services/integrationHelper';
import { getIntegrationSdk, getSdk, handleError } from '@services/sdk';
import type { TFoodInRestaurant } from '@src/types/bookerSelectRestaurant';
import { denormalisedResponseEntities, Listing } from '@src/utils/data';
import { convertWeekDay, VNTimezone } from '@src/utils/dates';
import type { TListing } from '@src/utils/types';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const apiMethod = req.method;
    const integrationSdk = getIntegrationSdk();
    const sdk = getSdk(req, res);

    if (apiMethod === HttpMethod.GET) {
      const params = JSON.parse(req.query.JSONParams as string);
      const { orderId, restaurantIdParam, timestamp } = params;

      const order = await fetchListing(orderId as string);
      const currentUserRes = await sdk.currentUser.show();
      const [companyAccount] = denormalisedResponseEntities(currentUserRes);

      const query = getMenuQuery({ order, params });
      const orderListing = Listing(order);
      const {
        memberAmount = 0,
        startDate,
        endDate,
        deliveryAddress = {},
        packagePerMember = 0,
        nutritions = [],
      } = orderListing.getMetadata();

      const allMenus: TListing[] = await queryAllPages({
        sdkModel: integrationSdk.listings,
        query,
      });

      const dateTime = DateTime.fromMillis(timestamp).setZone(VNTimezone);
      const dayOfWeek = convertWeekDay(dateTime.weekday).key;
      const foodIds = new Set<string>();
      const groupedRestaurantIdInMenuDatas = new Map<string, TListing[]>();

      allMenus.forEach((menu) => {
        const menuListing = Listing(menu);
        const { restaurantId, [`${dayOfWeek}FoodIdList`]: dayOfWeekInFoods } =
          menuListing.getMetadata();
        if (!restaurantId || !dayOfWeekInFoods) return;

        groupedRestaurantIdInMenuDatas.set(restaurantId, [
          ...(groupedRestaurantIdInMenuDatas.get(restaurantId) || []),
          menu,
        ]);
        dayOfWeekInFoods.forEach((id: string) => foodIds.add(id));
      });

      const totalRestaurantIds = [restaurantIdParam];
      const slicedRestaurantIdsBy100 = chunk(totalRestaurantIds, 100);

      const restaurantQueries = slicedRestaurantIdsBy100.map((restaurantIds) =>
        getRestaurantQuery({
          restaurantIds,
          companyAccount,
          params: {
            memberAmount,
            startDate,
            endDate,
          },
        }),
      );

      const restaurantsResponse = await Promise.all(
        restaurantQueries.map(async (restaurantQuery) => {
          const response = await integrationSdk.listings.query(restaurantQuery);

          return denormalisedResponseEntities(response);
        }),
      );

      const foodQueries = chunk(Array.from(foodIds), 100).map((slicedFoodIds) =>
        queryAllFoodIdList(slicedFoodIds, nutritions),
      );

      const foodsResponse = await Promise.all(
        foodQueries.map(async (foodQuery) => {
          const response = await integrationSdk.listings.query(foodQuery);

          return denormalisedResponseEntities(response);
        }),
      );

      const mapFoodId = new Map<string, TListing>();
      flatten(foodsResponse).forEach((food: TListing) => {
        mapFoodId.set(food.id.uuid, food);
      });

      const combinedRestaurantInFoods: TFoodInRestaurant[] = [];

      flatten(restaurantsResponse).forEach((restaurant: TListing) => {
        const restaurantListing = Listing(restaurant);
        const restaurantId = restaurantListing.getId();

        const isValidKeyWords = filterRestaurant(
          restaurant,
          timestamp,
          deliveryAddress,
        );
        const menus = groupedRestaurantIdInMenuDatas.get(restaurantId);

        if (isValidKeyWords && menus) {
          menus.forEach((menu) => {
            const combinedFoodsMenuData = parseFoodsFromMenu(
              menu,
              dayOfWeek,
              mapFoodId,
              packagePerMember,
            );
            if (combinedFoodsMenuData.length) {
              combinedRestaurantInFoods.push(...combinedFoodsMenuData);
            }
          });
        }
      });

      return res.status(200).json({
        foodsByRestaurantAndTimestamp: combinedRestaurantInFoods,
      });
    }
  } catch (error) {
    console.error(error);
    handleError(res, error);
  }
}

export default cookies(handler);
