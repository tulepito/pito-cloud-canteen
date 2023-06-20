import isEmpty from 'lodash/isEmpty';

import { Listing } from '@src/utils/data';
import { EParticipantOrderStatus, ESubOrderStatus } from '@utils/enums';
import type { TListing, TObject } from '@utils/types';

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
        restaurant: { id, restaurantName, foodList: foodListOfDate = {} },
        status: subOrderStatus,
      } = rawOrderDetailOfDate as TObject;
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

export const groupFoodOrderByDateFromQuotation = ({
  quotation,
}: {
  quotation: TListing;
}) => {
  const quotationListingGetter = Listing(quotation);
  const { client, partner } = quotationListingGetter.getMetadata();
  if (isEmpty(client) || isEmpty(partner)) {
    return [];
  }

  const result = Object.keys(client.quotation).map(
    (subOrderDate: string, index: number) => {
      const restaurant = Object.keys(partner).find((restaurantId: string) => {
        return Object.keys(partner[restaurantId].quotation).some(
          (date: string) => date === subOrderDate,
        );
      });

      return {
        date: subOrderDate,
        restaurantId: Object.keys(partner[restaurant!])[0],
        restaurantName: partner[restaurant!].name,
        index,
        totalDishes: client.quotation[subOrderDate].reduce(
          (previousResult: number, current: TObject) => {
            const { frequency } = current;

            return previousResult + frequency;
          },
          0,
        ),
        foodDataList: client.quotation[subOrderDate],
        totalPrice: client.quotation[subOrderDate].reduce(
          (previousResult: number, current: TObject) => {
            const { foodPrice, frequency } = current;

            return previousResult + foodPrice * frequency;
          },
          0,
        ),
      };
    },
  );

  return result;
};
