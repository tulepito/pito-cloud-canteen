import { Listing } from '@utils/data';
import { DateTime } from 'luxon';

export const normalizePlanDetailsToEvent = (planDetails: any, order: any) => {
  const dateList = Object.keys(planDetails);
  const { plans = [] } = Listing(order).getMetadata();
  const planId = plans.length > 0 ? plans[0] : undefined;

  const normalizeData = dateList.map((timestamp) => {
    const planData = planDetails[timestamp]?.restaurant || {};
    const foodIds = Object.keys(planData.foodList);
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
        restaurant: {
          id: planData?.restaurant?.id,
          name: planData?.restaurant?.restaurantName,
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
