// orderDetail?: {
//     [date: string]: {
//       restaurant: {
//         id: string;
//         restaurantName: string;
//       };
//       foodList: {
//         [foodId: string]: {
//           foodPrice: number;
//           foodName: string;
//         };
//       };
//     };
//   };

import { DateTime } from 'luxon';

export const normalizePlanDetailsToEvent = (planDetails: any) => {
  const dateList = Object.keys(planDetails);

  const normalizeData = dateList.map((timestamp) => {
    const planData = planDetails[timestamp];
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
      },
      title: 'PT3040',
      start: DateTime.fromMillis(Number(timestamp)).startOf('day').toJSDate(),
      end: DateTime.fromMillis(Number(timestamp)).endOf('day').toJSDate(),
    };
  });
  return normalizeData;
};
