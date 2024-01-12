import chunk from 'lodash/chunk';
import flatten from 'lodash/flatten';
import isEmpty from 'lodash/isEmpty';
import uniq from 'lodash/uniq';
import { DateTime } from 'luxon';

import { queryAllListings } from '@helpers/apiHelpers';
import {
  getMenuQuery,
  getMenuQueryWithDraftOrderData,
  getRestaurantQuery,
} from '@helpers/listingSearchQuery';
import { initLineItemsFromFoodList } from '@helpers/orderHelper';
import { adminQueryListings, fetchListing } from '@services/integrationHelper';
import { Listing } from '@src/utils/data';
import { convertWeekDay, VNTimezone } from '@src/utils/dates';
import type { TListing, TObject } from '@src/utils/types';

import {
  combineMenusWithRestaurantData,
  filterMenusHavePackagePerMember,
  prepareMenuFoodList,
  prepareParamsFromGivenParamsForAllDays,
  prepareParamsFromGivenParamsForSpecificDay,
  prepareParamsFromOrderForAllDays,
  prepareParamsFromOrderForSpecificDay,
  prepareRestaurantDataForOrderDetail,
} from './prepareData';

export const recommendRestaurantForSpecificDay = async ({
  orderId,
  timestamp,
  recommendParams = {},
  shouldCalculateDistance,
  favoriteRestaurantIdList = [],
}: {
  orderId: string;
  timestamp: number;
  recommendParams?: TObject;
  shouldCalculateDistance: boolean;
  favoriteRestaurantIdList?: string[];
}) => {
  const order = await fetchListing(orderId);

  const menuQueryParams = {
    timestamp,
    favoriteRestaurantIdList,
  };
  // * recommend from order data
  const {
    packagePerMember = 0,
    nutritions,
    menuQuery,
    memberAmount,
    orderDetail,
    deliveryOrigin,
    mealType,
    isNormalOrder,
  } = isEmpty(recommendParams)
    ? await prepareParamsFromOrderForSpecificDay({
        order,
        menuQueryParams,
      })
    : prepareParamsFromGivenParamsForSpecificDay({
        recommendParams,
        menuQueryParams,
      });
  // * query all menus
  const allMenus = await queryAllListings({
    query: menuQuery,
  });

  // filter all menus having publicData.foodsBydate[dayOfWeek]'s values.price === packagePerMember
  const filteredMenus = filterMenusHavePackagePerMember(
    allMenus,
    timestamp,
    packagePerMember,
  );

  // * query all restaurant
  const restaurantIdList = chunk(
    uniq<string>(
      filteredMenus.map(
        (menu: TListing) => menu?.attributes?.metadata?.restaurantId,
      ),
    ),
    100,
  );
  const restaurantsResponse = flatten(
    await Promise.all(
      restaurantIdList.map(async (ids) =>
        adminQueryListings(
          getRestaurantQuery({
            restaurantIds: ids,
            companyAccount: null,
            params: {
              memberAmount,
            },
          }),
        ),
      ),
    ),
  );
  // * map restaurant with menu data
  const restaurants = combineMenusWithRestaurantData({
    menus: filteredMenus,
    restaurants: restaurantsResponse,
    shouldCalculateDistance,
    deliveryOrigin,
  });
  if (restaurants.length > 0) {
    const randomNumber = Math.floor(Math.random() * (restaurants.length - 1));
    const otherRandomNumber = Math.abs(randomNumber - restaurants.length + 1);
    const randomRestaurantObjA = restaurants[randomNumber];

    const randomRestaurantObj =
      randomRestaurantObjA.restaurantInfo?.id?.uuid !==
      orderDetail[timestamp]?.restaurant?.id
        ? randomRestaurantObjA
        : restaurants[otherRandomNumber];

    const { menu, restaurant } = randomRestaurantObj;

    const foodList = await prepareMenuFoodList({
      menu,
      restaurant,
      timestamp,
      nutritions,
      packagePerMember,
      mealType,
    });

    return {
      ...orderDetail,
      lineItems: initLineItemsFromFoodList(foodList, isNormalOrder),
      [timestamp]: {
        ...orderDetail[timestamp],
        restaurant: prepareRestaurantDataForOrderDetail(
          restaurant,
          menu,
          foodList,
        ),
      },
    };
  }

  return {
    ...orderDetail,
    [timestamp]: {
      ...orderDetail[timestamp],
      hasNoRestaurants: true,
    },
  };
};

export const recommendRestaurants = async ({
  orderId,
  recommendParams = {},
  shouldCalculateDistance,
  favoriteRestaurantIdList = [],
}: {
  orderId: string;
  recommendParams?: TObject;
  shouldCalculateDistance: boolean;
  favoriteRestaurantIdList?: string[];
}) => {
  const orderDetail: TObject = {};
  const order = await fetchListing(orderId as string);
  console.log('🚀 ~ order:', order);

  const {
    nutritions,
    deliveryOrigin,
    packagePerMember,
    memberAmount,
    mealType,
    dayInWeek,
    totalDates,
    isNormalOrder,
  } = isEmpty(recommendParams)
    ? await prepareParamsFromOrderForAllDays({ order })
    : prepareParamsFromGivenParamsForAllDays({ recommendParams });

  const lineItemsMaybe = isNormalOrder ? { lineItems: [] } : {};

  await Promise.all(
    totalDates.map(async (timestamp) => {
      // * query all menus
      const menuQueryParams = {
        timestamp,
        favoriteRestaurantIdList,
      };
      const menuQuery = isEmpty(recommendParams)
        ? getMenuQuery({
            order,
            params: menuQueryParams,
          })
        : getMenuQueryWithDraftOrderData({
            params: menuQueryParams,
            orderParams: recommendParams,
          });
      const allMenus = await queryAllListings({
        query: menuQuery,
      });

      // filter all menus having publicData.foodsBydate[dayOfWeek]'s values.price === packagePerMember
      const filteredMenus = filterMenusHavePackagePerMember(
        allMenus,
        timestamp,
        packagePerMember,
      );

      // * query all restaurant
      const restaurantIdList = chunk(
        uniq<string>(
          filteredMenus.map((menu: TListing) => {
            const { restaurantId } = Listing(menu).getMetadata();

            return restaurantId;
          }),
        ),
        100,
      );
      const restaurantsResponse = flatten(
        await Promise.all(
          restaurantIdList.map(async (ids) =>
            adminQueryListings(
              getRestaurantQuery({
                restaurantIds: ids,
                companyAccount: null,
                params: {
                  memberAmount,
                },
              }),
            ),
          ),
        ),
      );

      // * map restaurant with menu data
      const restaurants = combineMenusWithRestaurantData({
        menus: filteredMenus,
        restaurants: restaurantsResponse,
        shouldCalculateDistance,
        deliveryOrigin,
      });

      if (restaurants.length > 0) {
        const randomRestaurant =
          restaurants[Math.floor(Math.random() * (restaurants.length - 1))];
        const { menu, restaurant } = randomRestaurant;

        const timestampWeekDay = convertWeekDay(
          DateTime.fromMillis(timestamp).setZone(VNTimezone).weekday,
        ).key;

        if (dayInWeek.includes(timestampWeekDay)) {
          const foodList = await prepareMenuFoodList({
            menu,
            restaurant,
            timestamp,
            nutritions,
            mealType,
            packagePerMember,
          });

          orderDetail[timestamp] = {
            ...orderDetail[timestamp],
            lineItems: initLineItemsFromFoodList(foodList, isNormalOrder),
            restaurant: prepareRestaurantDataForOrderDetail(
              restaurant,
              menu,
              foodList,
            ),
            hasNoRestaurants: false,
          };
        } else {
          orderDetail[timestamp] = {
            ...orderDetail[timestamp],
            ...lineItemsMaybe,
            hasNoRestaurants: false,
          };
        }
      } else {
        orderDetail[timestamp] = {
          ...orderDetail[timestamp],
          ...lineItemsMaybe,
          hasNoRestaurants: true,
        };
      }
    }),
  );

  return orderDetail;
};
