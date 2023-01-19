import { EParticipantOrderStatus } from '@utils/enums';
import type { TObject } from '@utils/types';

export const groupFoodOrderByDate = ({
  orderDetail = {},
}: {
  orderDetail: TObject;
}) => {
  return Object.entries(orderDetail).reduce(
    (result, currentOrderDetailEntry, index) => {
      const [date, rawOrderDetailOfDate] = currentOrderDetailEntry;

      const {
        memberOrders,
        foodList: foodListOfDate,
        restaurant: { restaurantName },
      } = rawOrderDetailOfDate as TObject;

      // Object.entries(foodListOfDate).reduce((result, foodData) => {}, );

      const foodDataMap = Object.entries(memberOrders).reduce(
        (foodFrequencyResult, currentMemberOrderEntry) => {
          const [, memberOrderData] = currentMemberOrderEntry;
          const { foodId, status } = memberOrderData as TObject;
          const { foodName, foodPrice } = foodListOfDate[foodId] || {};

          if (status === EParticipantOrderStatus.joined && foodId !== '') {
            const data = foodFrequencyResult[foodId] as TObject;
            const { frequency } = data || {};

            return {
              ...foodFrequencyResult,
              [foodId]: data
                ? { ...data, frequency: frequency + 1 }
                : { foodId, foodName, foodPrice, frequency: 1 },
            };
          }

          return foodFrequencyResult;
        },
        {} as TObject,
      );
      const foodDataList = Object.values(foodDataMap);
      const summary = foodDataList.reduce(
        (previousResult: TObject, current: TObject) => {
          const { totalPrice, totalDishes } = previousResult;
          const { frequency, foodPrice } = current;

          return {
            ...previousResult,
            totalDishes: totalDishes + frequency,
            totalPrice: totalPrice + foodPrice * frequency,
          };
        },
        {
          totalDishes: 0,
          totalPrice: 0,
          restaurantName,
        } as TObject,
      );

      return [
        ...result,
        {
          date,
          index,
          ...summary,
          foodDataList,
        },
      ];
    },
    [] as TObject[],
  );
};
