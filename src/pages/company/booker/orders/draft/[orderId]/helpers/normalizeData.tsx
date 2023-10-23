import compact from 'lodash/compact';
import isEmpty from 'lodash/isEmpty';
import { DateTime } from 'luxon';

import { Listing } from '@utils/data';
import { getDaySessionFromDeliveryTime } from '@utils/dates';

export const normalizePlanDetailsToEvent = (
  planDetails: any,
  order: any,
  coverImageList: any,
) => {
  const dateList = Object.keys(planDetails);

  const isAllDatesHaveNoRestaurants: boolean = Object.values(planDetails).every(
    ({ hasNoRestaurants = false }: any) => hasNoRestaurants,
  );

  if (isAllDatesHaveNoRestaurants) {
    return [];
  }

  const { deliveryHour, daySession } = Listing(order).getMetadata();

  const normalizeData = compact(
    dateList.map((timestamp) => {
      const planData = planDetails[timestamp] || {};
      const foodIds = Object.keys(planData?.restaurant?.foodList || {});
      const foodList = foodIds.map((id) => {
        return {
          key: id,
          value: planData?.foodList?.[id]?.foodName,
          price: planData?.foodList?.[id]?.foodPrice,
        };
      });

      const restaurantMaybe = {
        id: planData?.restaurant?.id,
        name: planData?.restaurant?.restaurantName,
        menuId: planData?.restaurant?.menuId,
        coverImage: coverImageList[planData?.restaurant?.id],
      };
      const isRestaurantEmpty = isEmpty(planData?.restaurant?.id);

      if (isRestaurantEmpty) {
        return null;
      }

      return {
        resource: {
          id: timestamp,
          daySession:
            daySession ||
            getDaySessionFromDeliveryTime(deliveryHour.split('-')[0]),
          isSelectedFood: !isEmpty(restaurantMaybe.id) && !isEmpty(foodList),
          restaurant: restaurantMaybe,
          meal: {
            dishes: foodList,
          },
          start: DateTime.fromMillis(Number(timestamp))
            .startOf('day')
            .toJSDate(),
          end: DateTime.fromMillis(Number(timestamp)).endOf('day').toJSDate(),
        },
      };
    }),
  );

  return normalizeData;
};
