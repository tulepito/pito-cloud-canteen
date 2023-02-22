import { Listing } from '@utils/data';
import { DateTime } from 'luxon';

export const normalizePlanDetailsToEvent = (planDetails: any, order: any) => {
  const dateList = Object.keys(planDetails);
  const planId = Listing(order).getMetadata()?.plans?.[0];

  const normalizeData = dateList.map((timestamp) => {
    const planData = planDetails[timestamp] || {};
    const foodIds = Object.keys(planData?.restaurant?.foodList);
    const foodList = foodIds.map((id) => {
      return {
        key: id,
        value: planData?.foodList?.[id]?.foodName,
        price: planData?.foodList?.[id]?.foodPrice,
      };
    });
    return {
      resource: {
        id: timestamp,
        daySession: 'MORNING_SESSION',
        isSelectedFood: foodList.length > 0,
        restaurant: {
          id: planData?.restaurant?.id,
          name: planData?.restaurant?.restaurantName,
          menuId: planData?.restaurant?.menuId,
        },
        meal: {
          dishes: foodList,
        },
        planId,
      },
      title: 'PT3040',
      start: DateTime.fromMillis(Number(timestamp)).startOf('day').toJSDate(),
      end: DateTime.fromMillis(Number(timestamp)).endOf('day').toJSDate(),
    };
  });
  return normalizeData;
};
