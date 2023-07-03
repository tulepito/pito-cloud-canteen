import isEmpty from 'lodash/isEmpty';

import { EParticipantOrderStatus, ESubOrderStatus } from '@utils/enums';
import type { TObject } from '@utils/types';

const groupFoodForGroupOrder = (
  orderDetail: TObject,
  date?: number | string,
) => {
  return Object.entries(orderDetail).reduce(
    (result, currentOrderDetailEntry, index) => {
      const [d, rawOrderDetailOfDate] = currentOrderDetailEntry;

      const {
        memberOrders,
        restaurant = {},
        status: subOrderStatus,
      } = rawOrderDetailOfDate as TObject;
      const { id, restaurantName, foodList: foodListOfDate = {} } = restaurant;
      if (
        subOrderStatus === ESubOrderStatus.CANCELED ||
        (date && d !== date.toString())
      ) {
        return result;
      }

      const foodDataMap = Object.entries(memberOrders).reduce(
        (foodFrequencyResult, currentMemberOrderEntry) => {
          const [, memberOrderData] = currentMemberOrderEntry;
          const {
            foodId,
            status,
            requirement = '',
          } = memberOrderData as TObject;
          const {
            foodName,
            foodPrice,
            foodUnit = '',
          } = foodListOfDate[foodId] || {};

          if (status === EParticipantOrderStatus.joined && foodId !== '') {
            const data = foodFrequencyResult[foodId] as TObject;
            const { frequency, notes = [] } = data || {};

            if (!isEmpty(requirement)) {
              notes.push(requirement);
            }

            return {
              ...foodFrequencyResult,
              [foodId]: data
                ? { ...data, frequency: frequency + 1, notes }
                : {
                    foodId,
                    foodName,
                    foodUnit,
                    foodPrice,
                    notes,
                    frequency: 1,
                  },
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
          date: d,
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

const groupFoodForNormal = (orderDetail: TObject, date?: number | string) => {
  return Object.entries(orderDetail).reduce(
    (result, currentOrderDetailEntry, index) => {
      const [d, rawOrderDetailOfDate] = currentOrderDetailEntry;

      const {
        lineItems = [],
        restaurant: { id, restaurantName, foodList: foodListOfDate = {} },
        status: subOrderStatus,
      } = rawOrderDetailOfDate as TObject;
      if (
        subOrderStatus === ESubOrderStatus.CANCELED ||
        (date && d !== date.toString())
      ) {
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
          date: d,
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
  date,
}: {
  orderDetail: TObject;
  isGroupOrder: boolean;
  date?: number | string;
}) => {
  return isGroupOrder
    ? groupFoodForGroupOrder(orderDetail, date)
    : groupFoodForNormal(orderDetail, date);
};
