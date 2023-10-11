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
  const { plans = [], deliveryHour, daySession } = Listing(order).getMetadata();
  const planId = plans.length > 0 ? plans[0] : undefined;

  const normalizeData = dateList.map((timestamp) => {
    const planData = planDetails[timestamp] || {};
    const foodIds = Object.keys(planData?.restaurant?.foodList || {});
    const foodList = foodIds.map((id) => {
      return {
        key: id,
        value: planData?.foodList?.[id]?.foodName,
        price: planData?.foodList?.[id]?.foodPrice,
      };
    });

    const restaurant = {
      id: planData?.restaurant?.id,
      name: planData?.restaurant?.restaurantName,
      menuId: planData?.restaurant?.menuId,
      coverImage: coverImageList[planData?.restaurant?.id],
    };

    return {
      resource: {
        id: timestamp,
        daySession:
          daySession ||
          getDaySessionFromDeliveryTime(deliveryHour.split('-')[0]),
        isSelectedFood: !isEmpty(restaurant.id) && !isEmpty(foodList),
        restaurant,
        meal: {
          dishes: foodList,
        },
        planId,
      },
      start: DateTime.fromMillis(Number(timestamp)).startOf('day').toJSDate(),
      end: DateTime.fromMillis(Number(timestamp)).endOf('day').toJSDate(),
    };
  });

  return normalizeData;
};
