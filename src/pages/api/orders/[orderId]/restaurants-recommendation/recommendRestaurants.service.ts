import uniq from 'lodash/uniq';
import { DateTime } from 'luxon';

import { queryAllListings } from '@helpers/apiHelpers';
import { getMenuQuery, getRestaurantQuery } from '@helpers/listingSearchQuery';
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
import type { TListing } from '@src/utils/types';

const maxKilometerFromRestaurantToDeliveryAddressForBooker =
  process.env
    .NEXT_PUBLIC_MAX_KILOMETER_FROM_RESTAURANT_TO_DELIVERY_ADDRESS_FOR_BOOKER;

const prepareMenuFoodList = async ({ restaurant, menu, timestamp }: any) => {
  // TODO: prepare foodList
  const dateTime = DateTime.fromMillis(+timestamp).setZone(VNTimezone);
  const dayOfWeek = convertWeekDay(dateTime.weekday).key;

  const menuListing = Listing(menu);
  const foodIdList = menuListing.getMetadata()[`${dayOfWeek}FoodIdList`];
  const foodListFromSharetribe = await queryAllListings({
    query: {
      ids: foodIdList,
      meta_isDeleted: false,
      meta_isFoodEnable: true,
      // ...(nutritions.length > 0
      //   ? { pub_specialDiets: `has_any:${nutritions.join(',')}` }
      //   : {}),
    },
  });
  const normalizedFoodList = getSelectedRestaurantAndFoodList({
    foodList: foodListFromSharetribe,
    foodIds: foodListFromSharetribe.map(
      (foodItem: TListing) => foodItem.id.uuid,
    ),
    currentRestaurant: restaurant,
  }).submitFoodListData;

  return normalizedFoodList;
};

export const recommendRestaurantForSpecificDay = async ({
  orderId,
  timestamp,
  shouldCalculateDistance,
}: {
  orderId: string;
  timestamp: number;
  shouldCalculateDistance: boolean;
}) => {
  const order = await fetchListing(orderId);
  const {
    plans = [],
    memberAmount = 0,
    deliveryAddress = {},
    companyId,
  } = Listing(order as TListing).getMetadata();

  const orderDeliveryOriginMaybe = deliveryAddress?.origin;
  const company = await fetchUser(companyId);
  const { companyLocation = {} } = User(company).getPublicData();
  const companyOriginMaybe = companyLocation?.origin;
  const deliveryOrigin = orderDeliveryOriginMaybe || companyOriginMaybe;

  const planListing = await fetchListing(plans[0]);

  const { orderDetail = {} } = Listing(planListing as TListing).getMetadata();

  const menuQueryParams = {
    timestamp,
  };
  const menuQuery = getMenuQuery({ order, params: menuQueryParams });
  const allMenus = await queryAllListings({
    query: menuQuery,
  });

  const restaurantIdList = uniq<any>(
    allMenus.map((menu: TListing) => {
      const { restaurantId } = Listing(menu).getMetadata();

      return restaurantId;
    }),
  ).slice(0, 100);

  const restaurantsQuery = getRestaurantQuery({
    restaurantIds: restaurantIdList,
    companyAccount: null,
    params: {
      memberAmount,
    },
  });

  const restaurantsResponse = await adminQueryListings(restaurantsQuery);

  const restaurants = allMenus.reduce((result: any, menu: TListing) => {
    const { restaurantId } = Listing(menu).getMetadata();
    const restaurantInfo = restaurantsResponse.find((restaurant: TListing) => {
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

  return orderDetail;
};

export const recommendRestaurants = async ({
  orderId,
  shouldCalculateDistance,
}: {
  orderId: string;
  shouldCalculateDistance: boolean;
}) => {
  const order = await fetchListing(orderId as string);
  const orderDetail: any = {};
  const {
    dayInWeek = [],
    startDate,
    endDate,
    orderType = EOrderType.group,
    companyId,
    deliveryAddress = {},
    memberAmount = 0,
  } = Listing(order as TListing).getMetadata();
  const isNormalOrder = orderType === EOrderType.normal;

  const orderDeliveryOriginMaybe = deliveryAddress?.origin;
  const company = await fetchUser(companyId);
  const { companyLocation = {} } = User(company).getPublicData();
  const companyOriginMaybe = companyLocation?.origin;
  const deliveryOrigin = orderDeliveryOriginMaybe || companyOriginMaybe;

  const totalDates = renderDateRange(startDate, endDate);
  await Promise.all(
    totalDates.map(async (timestamp) => {
      const menuQueryParams = {
        timestamp,
      };
      const menuQuery = getMenuQuery({
        order,
        params: menuQueryParams,
      });
      const allMenus = await queryAllListings({
        query: menuQuery,
      });
      const restaurantIdList = uniq<any>(
        allMenus.map((menu: TListing) => {
          const { restaurantId } = Listing(menu).getMetadata();

          return restaurantId;
        }),
      ).slice(0, 100);

      const restaurantsQuery = getRestaurantQuery({
        restaurantIds: restaurantIdList,
        companyAccount: null,
        params: {
          memberAmount,
        },
      });

      const listings = await adminQueryListings(restaurantsQuery);

      const restaurants = allMenus.reduce((result: any, menu: TListing) => {
        const { restaurantId } = Listing(menu).getMetadata();
        const restaurantInfo = listings.find((restaurant: TListing) => {
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

            return (
              isValidRestaurant && restaurantGetter.getId() === restaurantId
            );
          }

          return restaurantGetter.getId() === restaurantId;
        });
        if (!restaurantInfo) return result;

        return result.concat({
          menu,
          restaurantInfo,
        });
      }, []);

      const lineItemsMaybe = isNormalOrder ? { lineItems: [] } : {};
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
          });

          orderDetail[timestamp] = {
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
            ...lineItemsMaybe,
            hasNoRestaurants: false,
          };
        }
      } else {
        orderDetail[timestamp] = {
          ...lineItemsMaybe,
          hasNoRestaurants: true,
        };
      }
    }),
  );

  return orderDetail;
};
