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
import { getSelectedRestaurantAndFoodList } from '@helpers/orderHelper';
import {
  adminQueryListings,
  fetchListing,
  fetchUser,
} from '@services/integrationHelper';
import { Listing, User } from '@src/utils/data';
import { convertWeekDay, renderDateRange, VNTimezone } from '@src/utils/dates';
import { EOrderType } from '@src/utils/enums';
import type { TListing, TObject } from '@src/utils/types';

const maxKilometerFromRestaurantToDeliveryAddressForBooker =
  process.env
    .NEXT_PUBLIC_MAX_KILOMETER_FROM_RESTAURANT_TO_DELIVERY_ADDRESS_FOR_BOOKER;

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
    const restaurantInfo = restaurants.find((restaurant: TListing) => {
      const restaurantGetter = Listing(restaurant);

      if (shouldCalculateDistance) {
        const { geolocation: restaurantOrigin } =
          restaurantGetter.getAttributes();

        const distanceToDeliveryPlace = calculateDistance(
          deliveryOrigin,
          restaurantOrigin,
        );
        const isValidRestaurant =
          distanceToDeliveryPlace <=
          Number(maxKilometerFromRestaurantToDeliveryAddressForBooker);

        return isValidRestaurant && restaurantGetter.getId() === restaurantId;
      }

      return restaurantGetter.getId() === restaurantId;
    });
    if (!restaurantInfo) return result;

    return result.concat({
      menu,
      restaurantInfo,
    });
  }, []);
};

const prepareMenuFoodList = async ({
  restaurant,
  menu,
  timestamp,
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
  let deliveryOrigin: any;
  let orderDetail;
  let memberAmount: number;
  let menuQuery;
  let packagePerMember = 0;
  let nutritions: string[] = [];
  const menuQueryParams = {
    timestamp,
  };

  // * recommend from order data
  if (isEmpty(recommendParams)) {
    const {
      plans = [],
      memberAmount: memberAmountInOrder = 0,
      deliveryAddress = {},
      companyId,
      nutritions: nutritionFromOrder = [],
      packagePerMember: packagePerMemberFromOrder,
    } = Listing(order as TListing).getMetadata();

    const orderDeliveryOriginMaybe = deliveryAddress?.origin;
    const company = await fetchUser(companyId);
    const { companyLocation = {} } = User(company).getPublicData();
    const companyOriginMaybe = companyLocation?.origin;

    const planListing = await fetchListing(plans[0]);

    deliveryOrigin = orderDeliveryOriginMaybe || companyOriginMaybe;
    orderDetail =
      Listing(planListing as TListing).getMetadata().orderDetail || {};
    memberAmount = memberAmountInOrder;
    nutritions = nutritionFromOrder;
    packagePerMember = packagePerMemberFromOrder;
    menuQuery = getMenuQuery({ order, params: menuQueryParams });
  } else {
    // * recommend from draft order data (recommend params)
    const {
      memberAmount: memberAmountFromParams = 0,
      deliveryOrigin: deliveryOriginFromParams,
      orderDetail: orderDetailFromParams,
      nutritions: nutritionFormParams = [],
      mealType = [],
      packagePerMember: packagePerMemberFromParams,
      daySession,
    } = recommendParams;
    deliveryOrigin = deliveryOriginFromParams;
    orderDetail = orderDetailFromParams;
    memberAmount = memberAmountFromParams;
    nutritions = nutritionFormParams;
    packagePerMember = packagePerMemberFromParams;

    menuQuery = getMenuQueryWithDraftOrderData({
      orderParams: {
        nutritions: nutritionFormParams,
        mealType,
        packagePerMember: packagePerMemberFromParams,
        daySession,
      },
      params: menuQueryParams,
    });
  }

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

    const randomRestaurantObjA = restaurants[randomNumber] || {};

    const randomRestaurantObj =
      randomRestaurantObjA.restaurantInfo?.id?.uuid !==
      orderDetail[timestamp]?.restaurant?.id
        ? randomRestaurantObjA
        : restaurants[otherRandomNumber];

    const { menu, restaurantInfo: randomRestaurant } =
      randomRestaurantObj || {};

    const randomRestaurantGetter = Listing(randomRestaurant);
    const randomRestaurantId = randomRestaurantGetter.getId();
    const { minQuantity = 0, maxQuantity = Number.MAX_VALUE } =
      randomRestaurantGetter.getPublicData();

    const foodList = await prepareMenuFoodList({
      menu,
      restaurant: randomRestaurant,
      timestamp,
      nutritions,
      packagePerMember,
    });

    const newRestaurantData = {
      id: randomRestaurantId,
      restaurantName: randomRestaurantGetter.getAttributes().title,
      restaurantOwnerId: randomRestaurant?.author?.id?.uuid,
      foodList,
      phoneNumber: randomRestaurantGetter.getPublicData().phoneNumber,
      menuId: menu.id.uuid,
      minQuantity,
      maxQuantity,
    };

    const newOrderDetail = {
      ...orderDetail,
      [timestamp]: {
        ...orderDetail[timestamp],
        restaurant: newRestaurantData,
      },
    };

    return newOrderDetail;
  }

  const newOrderDetail = {
    ...orderDetail,
    [timestamp]: {
      ...orderDetail[timestamp],
      hasNoRestaurants: true,
    },
  };

  return newOrderDetail;
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
  let deliveryOrigin: any;
  const orderDetail: TObject = {};
  let memberAmount: any;
  let nutritions: string[] = [];
  let packagePerMember = 0;
  let totalDates: number[] = [];
  let isNormalOrder = false;
  let dayInWeek: string[] = [];
  const order = await fetchListing(orderId as string);

  // * recommend from order data
  if (isEmpty(recommendParams)) {
    const {
      dayInWeek: dayInWeekInOrder = [],
      startDate,
      endDate,
      orderType = EOrderType.group,
      companyId,
      deliveryAddress = {},
      memberAmount: memberAmountInOrder = 0,
      packagePerMember: packagePerMemberFromOrder,
      nutritions: nutritionFormOrder = [],
    } = Listing(order as TListing).getMetadata();

    const orderDeliveryOriginMaybe = deliveryAddress?.origin;
    const company = await fetchUser(companyId);
    const { companyLocation = {} } = User(company).getPublicData();
    const companyOriginMaybe = companyLocation?.origin;

    isNormalOrder = orderType === EOrderType.normal;
    memberAmount = memberAmountInOrder;
    deliveryOrigin = orderDeliveryOriginMaybe || companyOriginMaybe;
    totalDates = renderDateRange(startDate, endDate);
    dayInWeek = dayInWeekInOrder;
    nutritions = nutritionFormOrder;
    packagePerMember = packagePerMemberFromOrder;
  } else {
    // * recommend from draft order data (recommend params)
    const {
      memberAmount: memberAmountFromParams = 0,
      deliveryOrigin: deliveryOriginFromParams,
      dayInWeek: dayInWeekFromParams,
      startDate: startDateFromParams,
      endDate: endDateFromParams,
      isNormalOrder: isNormalOrderFromParams,
      nutrition: nutritionsFormParams,
      packagePerMember: packagePerMemberFromParams,
    } = recommendParams;
    packagePerMember = packagePerMemberFromParams;

    isNormalOrder = isNormalOrderFromParams;
    deliveryOrigin = deliveryOriginFromParams;
    memberAmount = memberAmountFromParams;
    dayInWeek = dayInWeekFromParams;
    totalDates = renderDateRange(startDateFromParams, endDateFromParams);
    nutritions = nutritionsFormParams;
    packagePerMember = packagePerMemberFromParams;
  }

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
        const restaurantGetter = Listing(randomRestaurant?.restaurantInfo);
        const { minQuantity = 0, maxQuantity = 100 } =
          restaurantGetter.getPublicData();

        if (
          dayInWeek.includes(
            convertWeekDay(
              DateTime.fromMillis(timestamp).setZone(VNTimezone).weekday,
            ).key,
          )
        ) {
          const foodList = await prepareMenuFoodList({
            menu: randomRestaurant?.menu,
            restaurant: randomRestaurant?.restaurantInfo,
            timestamp,
            nutritions,
            packagePerMember,
          });

          orderDetail[timestamp] = {
            ...orderDetail[timestamp],
            restaurant: {
              id: restaurantGetter.getId(),
              restaurantName: restaurantGetter.getAttributes().title,
              foodList,
              menuId: randomRestaurant?.menu.id.uuid,
              minQuantity,
              maxQuantity,
              restaurantOwnerId:
                randomRestaurant?.restaurantInfo?.author?.id?.uuid,
              phoneNumber: Listing(
                randomRestaurant?.restaurantInfo,
              ).getPublicData()?.phoneNumber,
            },
            ...lineItemsMaybe,
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
