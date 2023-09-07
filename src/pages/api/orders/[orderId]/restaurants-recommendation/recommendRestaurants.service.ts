import uniq from 'lodash/uniq';
import { DateTime } from 'luxon';

import { queryAllListings } from '@helpers/apiHelpers';
import { getMenuQuery, getRestaurantQuery } from '@helpers/listingSearchQuery';
import { adminQueryListings, fetchListing } from '@services/integrationHelper';
import { Listing } from '@src/utils/data';
import { convertWeekDay, renderDateRange } from '@src/utils/dates';
import { EOrderType } from '@src/utils/enums';
import type { TListing } from '@src/utils/types';

export const recommendRestaurantForSpecificDay = async (
  orderId: string,
  timestamp: number,
) => {
  const order = await fetchListing(orderId);
  const { plans = [], memberAmount = 0 } = Listing(
    order as TListing,
  ).getMetadata();

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
    const restaurantInfo = restaurantsResponse.find(
      (restaurant: TListing) => Listing(restaurant).getId() === restaurantId,
    );
    if (!restaurantInfo) return result;

    return result.concat({
      menu,
      restaurantInfo,
    });
  }, []);

  if (restaurants.length > 0) {
    const randomNumber = Math.floor(Math.random() * (restaurants.length - 1));
    const otherRandomNumber = Math.abs(randomNumber - restaurants.length + 1);

    const randomRestaurant =
      restaurants[randomNumber]?.restaurantInfo?.id?.uuid !==
      orderDetail[timestamp]?.restaurant?.id
        ? restaurants[randomNumber]?.restaurantInfo
        : restaurants[otherRandomNumber]?.restaurantInfo;

    const randomRestaurantGetter = Listing(randomRestaurant);
    const randomRestaurantId = randomRestaurantGetter.getId();
    const { minQuantity = 0, maxQuantity = Number.MAX_VALUE } =
      randomRestaurantGetter.getMetadata();

    const newRestaurantData = {
      id: randomRestaurantId,
      restaurantName: randomRestaurantGetter.getAttributes().title,
      restaurantOwnerId: randomRestaurant?.author?.id?.uuid,
      foodList: [],
      phoneNumber: randomRestaurantGetter.getPublicData().phoneNumber,
      menuId: restaurants[randomNumber]?.menu.id.uuid,
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

export const recommendRestaurants = async (orderId: string) => {
  const order = await fetchListing(orderId as string);
  const orderDetail: any = {};
  const {
    dayInWeek = [],
    startDate,
    endDate,
    orderType = EOrderType.group,
    memberAmount = 0,
  } = Listing(order as TListing).getMetadata();
  const isNormalOrder = orderType === EOrderType.normal;
  const totalDates = renderDateRange(startDate, endDate);

  await Promise.all(
    totalDates.map(async (dateTime) => {
      if (
        dayInWeek.includes(
          convertWeekDay(DateTime.fromMillis(dateTime).weekday).key,
        )
      ) {
        const menuQueryParams = {
          timestamp: dateTime,
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
          const restaurantInfo = listings.find(
            (restaurant: TListing) =>
              Listing(restaurant).getId() === restaurantId,
          );
          if (!restaurantInfo) return result;

          return result.concat({
            menu,
            restaurantInfo,
          });
        }, []);

        if (restaurants.length > 0) {
          const randomRestaurant =
            restaurants[Math.floor(Math.random() * (restaurants.length - 1))];
          const restaurantGetter = Listing(randomRestaurant?.restaurantInfo);
          const { minQuantity = 0, maxQuantity = 100 } =
            restaurantGetter.getPublicData();
          const lineItemsMaybe = isNormalOrder ? { lineItems: [] } : {};

          orderDetail[dateTime] = {
            restaurant: {
              id: restaurantGetter.getId(),
              restaurantName: restaurantGetter.getAttributes().title,
              foodList: [],
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
          };
        }
      }
    }),
  );

  return orderDetail;
};
