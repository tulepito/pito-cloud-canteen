import { Listing } from '@src/utils/data';
import {
  EOrderStates,
  EOrderType,
  EParticipantOrderStatus,
} from '@src/utils/enums';
import type { TPlan } from '@src/utils/orderTypes';
import type { TListing, TObject } from '@src/utils/types';

export const checkMinMaxQuantityInProgressState = (
  orderData: TObject | null,
  orderDetail: TPlan['orderDetail'] = {},
  oldOrderDetail: TPlan['orderDetail'] = {},
  isAdminFlow = false,
) => {
  let planValidationsInProgressState = {};
  const { orderState, orderType } = Listing(
    orderData as TListing,
  ).getMetadata();
  const isInProgress = orderState === EOrderStates.inProgress;
  const isNormalOrder = orderType === EOrderType.normal;
  if (!isInProgress) {
    return {
      planValidationsInProgressState,
      orderReachMaxRestaurantQuantity: false,
      orderReachMinRestaurantQuantity: false,
      orderReachMaxCanModify: false,
    };
  }
  if (isNormalOrder) {
    planValidationsInProgressState = Object.keys(orderDetail).reduce(
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
            planReachMaxCanModify: false,
          },
        };
      },
      {},
    );
  } else {
    planValidationsInProgressState = Object.keys(orderDetail).reduce(
      (prev: any, dateAsTimeStamp) => {
        const currentOrderDetails = orderDetail[dateAsTimeStamp] || {};
        const { memberOrders = {}, restaurant } = currentOrderDetails;
        const { maxQuantity = 100, minQuantity = 1 } = restaurant || {};

        const { memberOrders: oldMemberOrders = {} } =
          oldOrderDetail?.[dateAsTimeStamp] || {};
        const oldTotalQuantity = Object.keys(oldMemberOrders).filter(
          (f) =>
            !!oldMemberOrders[f].foodId &&
            oldMemberOrders[f].status === EParticipantOrderStatus.joined,
        ).length;
        const totalQuantity = Object.keys(memberOrders).filter(
          (f) =>
            !!memberOrders[f].foodId &&
            memberOrders[f].status === EParticipantOrderStatus.joined,
        ).length;

        const totalTimeCanChange = (totalQuantity * 10) / 100;
        const totalAdded = totalQuantity - oldTotalQuantity;
        const planReachMaxCanModify = totalAdded > totalTimeCanChange;

        return {
          ...prev,
          [dateAsTimeStamp]: {
            planReachMinRestaurantQuantity: totalQuantity < minQuantity,
            planReachMaxRestaurantQuantity:
              isAdminFlow && totalQuantity > maxQuantity,
            planReachMaxCanModify: !isAdminFlow && planReachMaxCanModify,
          },
        };
      },
      {},
    );
  }
  const orderReachMinRestaurantQuantity = Object.keys(
    planValidationsInProgressState,
  ).some((dateAsTimeStamp) => {
    const { planReachMinRestaurantQuantity } =
      planValidationsInProgressState[
        dateAsTimeStamp as keyof typeof planValidationsInProgressState
      ] || {};

    return planReachMinRestaurantQuantity;
  });

  const orderReachMaxRestaurantQuantity = Object.keys(
    planValidationsInProgressState,
  ).some((dateAsTimeStamp) => {
    const { planReachMaxRestaurantQuantity } =
      planValidationsInProgressState[
        dateAsTimeStamp as keyof typeof planValidationsInProgressState
      ];

    return planReachMaxRestaurantQuantity;
  });

  const orderReachMaxCanModify = Object.keys(
    planValidationsInProgressState,
  ).some((dateAsTimeStamp) => {
    const { planReachMaxCanModify } =
      planValidationsInProgressState[
        dateAsTimeStamp as keyof typeof planValidationsInProgressState
      ];

    return planReachMaxCanModify;
  });

  return {
    planValidationsInProgressState,
    orderReachMaxRestaurantQuantity,
    orderReachMinRestaurantQuantity,
    orderReachMaxCanModify,
  };
};
