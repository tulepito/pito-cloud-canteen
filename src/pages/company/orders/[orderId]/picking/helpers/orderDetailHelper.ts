import { EParticipantOrderStatus, ESubOrderStatus } from '@utils/enums';
import type { TObject } from '@utils/types';

const groupFoodForGroupOrder = (orderDetail: TObject) => {
  return Object.entries(orderDetail).reduce(
    (result, currentOrderDetailEntry, index) => {
      const [date, rawOrderDetailOfDate] = currentOrderDetailEntry;

      const {
        memberOrders,
        restaurant = {},
        status: subOrderStatus,
      } = rawOrderDetailOfDate as TObject;
      const { id, restaurantName, foodList: foodListOfDate = {} } = restaurant;
      if (subOrderStatus === ESubOrderStatus.CANCELED) {
        return result;
      }

      const foodDataMap = Object.entries(memberOrders).reduce(
        (foodFrequencyResult, currentMemberOrderEntry) => {
          const [, memberOrderData] = currentMemberOrderEntry;
          const { foodId, status } = memberOrderData as TObject;
          const {
            foodName,
            foodPrice,
            foodUnit = '',
          } = foodListOfDate[foodId] || {};

          if (status === EParticipantOrderStatus.joined && foodId !== '') {
            const data = foodFrequencyResult[foodId] as TObject;
            const { frequency } = data || {};

            return {
              ...foodFrequencyResult,
              [foodId]: data
                ? { ...data, frequency: frequency + 1 }
                : { foodId, foodName, foodUnit, foodPrice, frequency: 1 },
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
          restaurantId: id,
        },
      ];
    },
    [] as TObject[],
  );
};

const groupFoodForNormal = (orderDetail: TObject) => {
  return Object.entries(orderDetail).reduce(
    (result, currentOrderDetailEntry, index) => {
      const [date, rawOrderDetailOfDate] = currentOrderDetailEntry;

      const {
        lineItems = [],
        restaurant: { id, restaurantName, foodList: foodListOfDate = {} },
        status: subOrderStatus,
      } = rawOrderDetailOfDate as TObject;
      if (subOrderStatus === ESubOrderStatus.CANCELED) {
        return result;
      }

      const foodDataList = lineItems.map((lineItem: TObject) => {
        const {
          id: foodId,
          name: foodName,
          quantity = 1,
          price: foodPrice,
        } = lineItem;
        const { foodUnit = '' } = foodListOfDate[foodId] || {};

        return { foodId, foodName, foodUnit, foodPrice, frequency: quantity };
      });

      const summary = lineItems.reduce(
        (previousResult: TObject, current: TObject) => {
          const { totalPrice, totalDishes } = previousResult;
          const { quantity = 1, price = 0 } = current;

          return {
            ...previousResult,
            totalDishes: totalDishes + quantity,
            totalPrice: totalPrice + price,
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
          restaurantId: id,
        },
      ];
    },
    [] as TObject[],
  );
};

export const groupFoodOrderByDate = ({
  orderDetail = {},
  isGroupOrder = true,
}: {
  orderDetail: TObject;
  isGroupOrder: boolean;
}) => {
  return isGroupOrder
    ? groupFoodForGroupOrder(orderDetail)
    : groupFoodForNormal(orderDetail);
};
