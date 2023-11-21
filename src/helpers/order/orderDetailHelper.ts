import isEmpty from 'lodash/isEmpty';

import { Listing, User } from '@src/utils/data';
import { TRANSITIONS_TO_STATE_CANCELED } from '@src/utils/transaction';
import type { TListing, TObject, TUser } from '@src/utils/types';
import { EParticipantOrderStatus, ESubOrderStatus } from '@utils/enums';

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
        lastTransition,
      } = rawOrderDetailOfDate as TObject;
      const { id, restaurantName, foodList: foodListOfDate = {} } = restaurant;
      if (
        subOrderStatus === ESubOrderStatus.canceled ||
        TRANSITIONS_TO_STATE_CANCELED.includes(lastTransition) ||
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
        restaurant = {},
        status: subOrderStatus,
        lastTransition,
      } = rawOrderDetailOfDate as TObject;
      const { id, restaurantName, foodList: foodListOfDate = {} } = restaurant;

      if (
        subOrderStatus === ESubOrderStatus.canceled ||
        TRANSITIONS_TO_STATE_CANCELED.includes(lastTransition) ||
        (date && d !== date.toString())
      ) {
        return result;
      }

      const foodDataList = lineItems.map((lineItem: TObject) => {
        const {
          id: foodId,
          name: foodName,
          quantity = 1,
          unitPrice: foodPrice = 0,
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

export const groupFoodOrderByDateFromQuotation = ({
  quotation,
  date: dateFromParams,
}: {
  quotation: TListing;
  date?: string | number;
}) => {
  const quotationListingGetter = Listing(quotation);
  const { client, partner } = quotationListingGetter.getMetadata();
  if (isEmpty(client) || isEmpty(partner)) {
    return [];
  }

  const result = Object.keys(client.quotation).reduce(
    (res: TObject[], subOrderDate: string, index: number) => {
      if (dateFromParams && dateFromParams !== subOrderDate) {
        return res;
      }
      const restaurant = Object.keys(partner).find((restaurantId: string) => {
        return Object.keys(partner[restaurantId].quotation).some(
          (date: string) => date === subOrderDate,
        );
      });

      return res.concat([
        {
          date: subOrderDate,
          restaurantId: Object.keys(partner[restaurant!])[0],
          restaurantName: partner[restaurant!].name,
          index: dateFromParams ? 0 : index,
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
        },
      ]);
    },
    [],
  );

  return result;
};

export const groupPickingOrderByFood = ({
  orderDetail,
  date,
  participants = [],
  anonymous = [],
}: {
  orderDetail: TObject;
  date?: number | string;
  participants: TObject[];
  anonymous: TObject[];
}) => {
  return Object.entries(orderDetail).reduce(
    (result, currentOrderDetailEntry, index) => {
      const [d, rawOrderDetailOfDate] = currentOrderDetailEntry;

      const {
        memberOrders = {},
        restaurant = {},
        status: subOrderStatus,
      } = rawOrderDetailOfDate as TObject;
      const { id, foodList: foodListOfDate = {} } = restaurant;
      if (
        subOrderStatus === ESubOrderStatus.canceled ||
        (date && d !== date.toString())
      ) {
        return result;
      }

      const foodDataMap = Object.entries(memberOrders).reduce(
        (foodFrequencyResult, currentMemberOrderEntry) => {
          const [memberId, memberOrderData] = currentMemberOrderEntry;
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

          const participantMaybe = participants.find(
            (p) => p?.id?.uuid === memberId,
          );
          const anonymousUserMaybe = anonymous.find(
            (p) => p?.id?.uuid === memberId,
          );
          const { firstName, lastName } = User(
            (participantMaybe || anonymousUserMaybe) as TUser,
          ).getProfile();

          if (status === EParticipantOrderStatus.joined && foodId !== '') {
            const data = foodFrequencyResult[foodId] as TObject;
            const { frequency, notes = [] } = data || {};
            const newNote = {
              note: requirement,
              name: `${lastName} ${firstName}`,
            };

            if (!isEmpty(requirement)) {
              notes.splice(0, 0, newNote);
            } else {
              notes.push(newNote);
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

      return [
        ...result,
        {
          date: d,
          index,
          foodDataList,
          restaurantId: id,
        },
      ];
    },
    [] as TObject[],
  );
};
