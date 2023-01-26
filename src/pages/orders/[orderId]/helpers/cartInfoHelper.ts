import { isJoinedPlan } from '@helpers/orderHelper';
import type { TObject } from '@utils/types';

export const calculateTotalPriceAndDishes = ({
  orderDetail = {},
}: {
  orderDetail: TObject;
}) => {
  return Object.entries<TObject>(orderDetail).reduce<TObject>(
    (result, currentOrderDetailEntry) => {
      const [, rawOrderDetailOfDate] = currentOrderDetailEntry;

      const { memberOrders, foodList: foodListOfDate } = rawOrderDetailOfDate;

      const foodDataMap = Object.entries(memberOrders).reduce<TObject>(
        (foodFrequencyResult, currentMemberOrderEntry) => {
          const [, memberOrderData] = currentMemberOrderEntry;
          const { foodId, status } = memberOrderData as TObject;
          const { foodName, foodPrice } = foodListOfDate[foodId] || {};

          if (isJoinedPlan(foodId, status)) {
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
        {},
      );

      const foodDataList = Object.values(foodDataMap);
      const totalInfo = foodDataList.reduce<TObject>(
        (previousResult, current: TObject) => {
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
        },
      );

      return {
        ...result,
        totalPrice: result.totalPrice + totalInfo.totalPrice,
        totalDishes: result.totalDishes + totalInfo.totalDishes,
      };
    },
    {
      totalDishes: 0,
      totalPrice: 0,
    },
  );
};
