import { EParticipantOrderStatus } from '@src/utils/enums';
import type { TPlan } from '@src/utils/orderTypes';
import type { TObject } from '@src/utils/types';

export const isJoinedPlan = (
  foodId: string,
  status: EParticipantOrderStatus,
) => {
  return foodId !== '' && status === EParticipantOrderStatus.joined;
};

export const checkMinMaxQuantityInPickingState = (
  isNormalOrder: boolean,
  isPicking: boolean,
  orderDetail: TPlan['orderDetail'] = {},
) => {
  if (!isPicking) {
    return {
      planValidations: {},
      orderReachMaxRestaurantQuantity: false,
      orderReachMinRestaurantQuantity: false,
    };
  }
  let planValidations = {};
  if (isNormalOrder) {
    planValidations = Object.keys(orderDetail).reduce(
      (prev: any, dateAsTimeStamp) => {
        const currentOrderDetails = orderDetail[dateAsTimeStamp];
        const { lineItems = [], restaurant = {} } = currentOrderDetails || {};
        const { maxQuantity = 100, minQuantity = 1 } = restaurant || {};
        const totalAdded = lineItems.reduce(
          (result: number, lineItem: TObject) => {
            result += lineItem?.quantity || 1;

            return result;
          },
          0,
        );

        return {
          ...prev,
          [dateAsTimeStamp]: {
            planReachMinRestaurantQuantity: totalAdded < minQuantity,
            planReachMaxRestaurantQuantity: totalAdded > maxQuantity,
          },
        };
      },
      {},
    );
  } else {
    planValidations = Object.keys(orderDetail).reduce(
      (prev: any, dateAsTimeStamp) => {
        const currentOrderDetails = orderDetail[dateAsTimeStamp] || {};
        const { memberOrders = {}, restaurant = {} } = currentOrderDetails;
        const { minQuantity = 0, maxQuantity = 100 } = restaurant;
        const totalAdded = Object.keys(memberOrders).filter((f) =>
          isJoinedPlan(memberOrders[f].foodId, memberOrders[f].status),
        ).length;

        return {
          ...prev,
          [dateAsTimeStamp]: {
            planReachMinRestaurantQuantity: totalAdded < minQuantity,
            planReachMaxRestaurantQuantity: totalAdded > maxQuantity,
          },
        };
      },
      {},
    );
  }
  const orderReachMinRestaurantQuantity = Object.keys(planValidations).some(
    (dateAsTimeStamp) => {
      const { planReachMinRestaurantQuantity } =
        planValidations[dateAsTimeStamp as keyof typeof planValidations] || {};

      return planReachMinRestaurantQuantity;
    },
  );
  const orderReachMaxRestaurantQuantity = Object.keys(planValidations).some(
    (dateAsTimeStamp) => {
      const { planReachMaxRestaurantQuantity } =
        planValidations[dateAsTimeStamp as keyof typeof planValidations];

      return planReachMaxRestaurantQuantity;
    },
  );

  return {
    planValidations,
    orderReachMaxRestaurantQuantity,
    orderReachMinRestaurantQuantity,
  };
};
