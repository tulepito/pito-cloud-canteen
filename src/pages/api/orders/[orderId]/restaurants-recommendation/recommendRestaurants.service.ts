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
import { calculateDistance } from '@helpers/mapHelpers';
import {
  getSelectedRestaurantAndFoodList,
  initLineItemsFromFoodList,
  mealTypeAdapter,
} from '@helpers/orderHelper';
import {
  adminQueryListings,
  fetchListing,
  fetchUser,
} from '@services/integrationHelper';
import config from '@src/configs';
import { Listing, User } from '@src/utils/data';
import { convertWeekDay, renderDateRange, VNTimezone } from '@src/utils/dates';
import { EOrderType } from '@src/utils/enums';
import type { TListing, TObject } from '@src/utils/types';

const combineMenusWithRestaurantData = ({
  menus,
  restaurants,
  shouldCalculateDistance,
  deliveryOrigin,
}: {
  menus: TListing[];
  restaurants: TListing[];
  shouldCalculateDistance: boolean;
  deliveryOrigin: TObject;
}) => {
  return menus.reduce((result: any, menu: TListing) => {
    const { restaurantId } = Listing(menu).getMetadata();
    const restaurant = restaurants.find((r: TListing) => {
      const restaurantGetter = Listing(r);

      if (shouldCalculateDistance) {
        const { geolocation: restaurantOrigin } =
          restaurantGetter.getAttributes();

        const distanceToDeliveryPlace = calculateDistance(
          deliveryOrigin,
          restaurantOrigin,
        );
        const isValidRestaurant =
          distanceToDeliveryPlace <=
          Number(config.maxKilometerFromRestaurantToDeliveryAddressForBooker);

        return isValidRestaurant && restaurantGetter.getId() === restaurantId;
      }

      return restaurantGetter.getId() === restaurantId;
    });

    return !restaurant
      ? result
      : result.concat({
          menu,
          restaurant,
        });
  }, []);
};

const prepareRestaurantDataForOrderDetail = (
  restaurant: TListing,
  menu: TListing,
  foodList: TObject,
) => {
  const restaurantGetter = Listing(restaurant);
  const { minQuantity = 0, maxQuantity = Number.MAX_VALUE } =
    restaurantGetter.getPublicData();

  return {
    id: restaurantGetter.getId(),
    restaurantName: restaurantGetter.getAttributes().title,
    restaurantOwnerId: restaurant.author?.id?.uuid,
    foodList,
    phoneNumber: restaurantGetter.getPublicData().phoneNumber,
    menuId: menu.id.uuid,
    minQuantity,
    maxQuantity,
  };
};

const prepareMenuFoodList = async ({
  restaurant,
  menu,
  timestamp,
  mealType: foodTypes = [],
  nutritions = [],
  packagePerMember = 0,
}: TObject) => {
  // * prepare params
  const dateTime = DateTime.fromMillis(+timestamp).setZone(VNTimezone);
  const dayOfWeek = convertWeekDay(dateTime.weekday).key;
  const foodIdList = Listing(menu).getMetadata()[`${dayOfWeek}FoodIdList`];

  // * query food list
  const foodListFromSharetribe = await queryAllListings({
    query: {
      ids: foodIdList,
      meta_isDeleted: false,
      meta_isFoodEnable: true,
      ...(foodTypes.length > 0
        ? {
            pub_foodType: foodTypes.map((item: string) =>
              mealTypeAdapter(item),
            ),
          }
        : {}),
      ...(nutritions.length > 0
        ? { pub_specialDiets: `has_any:${nutritions.join(',')}` }
        : {}),
    },
  });

  // * find valid food items
  const suitableFoodList = foodListFromSharetribe.filter(
    (foodListing: TListing) => {
      if (packagePerMember <= 0) return true;

      return (
        Listing(foodListing).getAttributes().price.amount <= packagePerMember
      );
    },
  );

  // * convert food list (array) to food map
  const normalizedFoodList = getSelectedRestaurantAndFoodList({
    foodList: suitableFoodList,
    foodIds: suitableFoodList.map((foodItem: TListing) => foodItem.id.uuid),
    currentRestaurant: restaurant,
  }).submitFoodListData;

  return normalizedFoodList;
};

const prepareParamsFromOrderForSpecificDay = async ({
  order,
  menuQueryParams,
}: TObject) => {
  const {
    plans = [],
    memberAmount = 0,
    deliveryAddress = {},
    companyId,
    nutritions = [],
    mealType = [],
    packagePerMember,
    orderType,
  } = Listing(order as TListing).getMetadata();
  const planListing = await fetchListing(plans[0]);

  const company = await fetchUser(companyId);
  const { companyLocation = {} } = User(company).getPublicData();

  return {
    isNormalOrder: orderType === EOrderType.normal,
    deliveryOrigin: deliveryAddress?.origin || companyLocation?.origin,
    orderDetail:
      Listing(planListing as TListing).getMetadata().orderDetail || {},
    memberAmount,
    nutritions,
    mealType,
    packagePerMember,
    menuQuery: getMenuQuery({ order, params: menuQueryParams }),
  };
};

// * recommend from draft order data (recommend params)
const prepareParamsFromGivenParamsForSpecificDay = ({
  recommendParams,
  menuQueryParams,
}: TObject) => {
  const {
    memberAmount = 0,
    deliveryOrigin,
    orderDetail,
    nutritions = [],
    mealType = [],
    packagePerMember,
    daySession,
    isNormalOrder = true,
  } = recommendParams;

  return {
    isNormalOrder,
    deliveryOrigin,
    orderDetail,
    memberAmount,
    mealType,
    nutritions,
    packagePerMember,
    menuQuery: getMenuQueryWithDraftOrderData({
      orderParams: {
        nutritions,
        mealType,
        packagePerMember,
        daySession,
      },
      params: menuQueryParams,
    }),
  };
};

export const recommendRestaurantForSpecificDay = async ({
  orderId,
  timestamp,
  recommendParams = {},
  shouldCalculateDistance,
}: {
  orderId: string;
  timestamp: number;
  recommendParams?: TObject;
  shouldCalculateDistance: boolean;
}) => {
  const order = await fetchListing(orderId);

  const menuQueryParams = {
    timestamp,
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

  // * query all restaurant
  const restaurantIdList = chunk(
    uniq<string>(
      allMenus.map((menu: TListing) => {
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
    menus: allMenus,
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

// * recommend from order data
const prepareParamsFromOrderForAllDays = async ({ order }: TObject) => {
  const {
    dayInWeek = [],
    startDate,
    endDate,
    orderType = EOrderType.group,
    companyId,
    deliveryAddress = {},
    memberAmount = 0,
    packagePerMember = 0,
    nutritions = [],
    mealType = [],
  } = Listing(order as TListing).getMetadata();

  const company = await fetchUser(companyId);
  const { companyLocation = {} } = User(company).getPublicData();

  return {
    nutritions,
    deliveryOrigin: deliveryAddress?.origin || companyLocation?.origin,
    packagePerMember,
    memberAmount,
    mealType,
    dayInWeek,
    totalDates: renderDateRange(startDate, endDate),
    isNormalOrder: orderType === EOrderType.normal,
  };
};
// * recommend from draft order data (recommend params)
const prepareParamsFromGivenParamsForAllDays = ({
  recommendParams,
}: TObject) => {
  const {
    memberAmount = 0,
    deliveryOrigin,
    dayInWeek,
    startDate,
    endDate,
    isNormalOrder,
    nutritions,
    mealType,
    packagePerMember,
  } = recommendParams;

  return {
    nutritions,
    deliveryOrigin,
    packagePerMember,
    memberAmount,
    mealType,
    dayInWeek,
    totalDates: renderDateRange(startDate, endDate),
    isNormalOrder,
  };
};

export const recommendRestaurants = async ({
  orderId,
  recommendParams = {},
  shouldCalculateDistance,
}: {
  orderId: string;
  recommendParams?: TObject;
  shouldCalculateDistance: boolean;
}) => {
  const orderDetail: TObject = {};
  const order = await fetchListing(orderId as string);

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

      // * query all restaurant
      const restaurantIdList = chunk(
        uniq<string>(
          allMenus.map((menu: TListing) => {
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
        menus: allMenus,
        restaurants: restaurantsResponse,
        shouldCalculateDistance,
        deliveryOrigin,
      });

      if (restaurants.length > 0) {
        const randomRestaurant =
          restaurants[Math.floor(Math.random() * (restaurants.length - 1))];
        const { menu, restaurant } = randomRestaurant;

        if (
          dayInWeek.includes(
            convertWeekDay(
              DateTime.fromMillis(timestamp).setZone(VNTimezone).weekday,
            ).key,
          )
        ) {
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
