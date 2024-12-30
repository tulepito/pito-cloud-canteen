import type { OrderDetail } from '@src/types';
import { Listing } from '@src/utils/data';
import {
  EOrderStates,
  EOrderType,
  EParticipantOrderStatus,
} from '@src/utils/enums';
import type { TListing, TObject } from '@src/utils/types';

type DifferentOrderDetailMember = {
  oldFoodId?: string;
  newFoodId?: string;
};

type DifferentOrderDetailLineItem = {
  foodId?: string;
  oldQuantity?: number;
  newQuantity?: number;
};

type DifferentOrderDetailValue = {
  memberOrders?: {
    [memberId: string]: DifferentOrderDetailMember;
  };
  lineItems?: DifferentOrderDetailLineItem[];
};

export type DifferentOrderDetail = {
  [date: string]: DifferentOrderDetailValue;
};

function getDifferentGroupOrderFoodsByDate(
  newOrderDetail: OrderDetail,
  oldOrderDetail: OrderDetail,
  timestamp: string,
) {
  return Object.keys(newOrderDetail).reduce((acc, date) => {
    const newMemberOrders = newOrderDetail[date]?.memberOrders;
    const oldMemberOrders = oldOrderDetail[date]?.memberOrders;

    if (date !== timestamp) {
      return acc;
    }

    const differentMemberOrders = Object.keys(newMemberOrders || {}).reduce(
      (memberAcc, memberId) => {
        if (
          newMemberOrders?.[memberId]?.foodId !==
          oldMemberOrders?.[memberId]?.foodId
        ) {
          return {
            ...memberAcc,
            [memberId]: {
              oldFoodId: oldMemberOrders?.[memberId]?.foodId,
              newFoodId: newMemberOrders?.[memberId]?.foodId,
            },
          };
        }

        if (
          newMemberOrders?.[memberId]?.status === 'notAllowed' &&
          oldMemberOrders?.[memberId]?.status !== 'notAllowed'
        ) {
          return {
            ...memberAcc,
            [memberId]: {
              oldFoodId: oldMemberOrders?.[memberId]?.foodId,
              newFoodId: undefined,
            },
          };
        }

        return memberAcc;
      },
      {} as {
        [memberId: string]: DifferentOrderDetailMember;
      },
    );

    if (Object.keys(differentMemberOrders).length) {
      const memberOrders = Object.keys(differentMemberOrders).reduce(
        (memberAcc, memberId) => {
          const { oldFoodId, newFoodId } = differentMemberOrders[memberId];

          return {
            ...memberAcc,
            [memberId]: {
              oldFoodId,
              newFoodId,
            },
          };
        },
        {} as {
          [memberId: string]: DifferentOrderDetailMember;
        },
      );

      return {
        ...acc,
        [date]: {
          memberOrders,
        },
      };
    }

    return acc;
  }, {} as DifferentOrderDetail);
}

function getDifferentNormalOrderFoodsByDate(
  newOrderDetail: OrderDetail,
  oldOrderDetail: OrderDetail,
  timestamp: string,
) {
  return Object.keys(newOrderDetail).reduce((acc, date) => {
    const newLineItems = newOrderDetail[date]?.lineItems;
    const oldLineItems = oldOrderDetail[date]?.lineItems;

    if (date !== timestamp) {
      return acc;
    }

    const removedLineItems = oldLineItems?.filter(
      (_lineItem) =>
        !newLineItems?.some((newLineItem) => newLineItem?.id === _lineItem?.id),
    );

    const addedLineItems = newLineItems?.filter(
      (_lineItem) =>
        !oldLineItems?.some((oldLineItem) => oldLineItem?.id === _lineItem?.id),
    );

    const updatedLineItems = newLineItems?.filter((_lineItem) =>
      oldLineItems?.some(
        (oldLineItem) =>
          oldLineItem?.id === _lineItem?.id &&
          oldLineItem?.quantity !== _lineItem?.quantity,
      ),
    );

    const changes = [
      ...(removedLineItems || []).map((lineItem) => ({
        foodId: lineItem?.id,
        oldQuantity: lineItem?.quantity,
        newQuantity: 0,
      })),
      ...(addedLineItems || []).map((lineItem) => ({
        foodId: lineItem?.id,
        oldQuantity: 0,
        newQuantity: lineItem?.quantity,
      })),
      ...(updatedLineItems || []).map((lineItem) => ({
        foodId: lineItem?.id,
        oldQuantity: oldLineItems?.find(
          (oldLineItem) => oldLineItem?.id === lineItem?.id,
        )?.quantity,
        newQuantity: lineItem?.quantity,
      })),
    ];

    return {
      ...acc,
      [date]: {
        lineItems: changes,
      },
    };
  }, {} as DifferentOrderDetail);
}

export const checkMinMaxQuantityInProgressState = (
  orderData: TObject | null,
  orderDetail: OrderDetail = {},
  oldOrderDetail: OrderDetail = {},
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
      (prev, dateAsTimeStamp) => {
        const currentOrderDetails = orderDetail[dateAsTimeStamp];
        const { lineItems = [], restaurant = {} } = currentOrderDetails || {};
        const { maxQuantity = 100, minQuantity = 1 } = restaurant || {};

        const diffentOrderDetail = getDifferentNormalOrderFoodsByDate(
          orderDetail,
          oldOrderDetail,
          dateAsTimeStamp,
        );
        const totalDifferentQuantity = Object.keys(diffentOrderDetail).reduce(
          (result, date) => {
            const totalQuantity = diffentOrderDetail[date]?.lineItems || [];

            result += totalQuantity.reduce((quantity, lineItem) => {
              const { oldQuantity = 0, newQuantity = 0 } = lineItem;

              return quantity + Math.abs(oldQuantity - newQuantity);
            }, 0);

            return result;
          },
          0,
        );

        const newTotalQuantity = lineItems.reduce((quantity, lineItem) => {
          return quantity + (lineItem?.quantity || 0);
        }, 0);

        const snapshotTotalQuantity = (
          oldOrderDetail[dateAsTimeStamp]?.lineItems || []
        ).reduce((quantity, lineItem) => {
          return quantity + (lineItem?.quantity || 0);
        }, 0);

        const totalTimeCanChange =
          (snapshotTotalQuantity *
            +process.env.NEXT_PUBLIC_MAX_ORDER_DETAIL_MODIFIED_PERCENT) /
          100;

        const planReachMaxCanModify =
          totalDifferentQuantity > totalTimeCanChange;

        return {
          ...prev,
          [dateAsTimeStamp]: {
            planReachMinRestaurantQuantity:
              !isAdminFlow && newTotalQuantity < minQuantity,
            planReachMaxRestaurantQuantity:
              !isAdminFlow && newTotalQuantity > maxQuantity,
            planReachMaxCanModify: !isAdminFlow && planReachMaxCanModify,
          },
        };
      },
      {},
    );
  } else {
    planValidationsInProgressState = Object.keys(orderDetail).reduce(
      (prev, dateAsTimeStamp) => {
        const currentOrderDetails = orderDetail[dateAsTimeStamp] || {};
        const { memberOrders, restaurant } = currentOrderDetails;
        const { maxQuantity = 100, minQuantity = 1 } = restaurant || {};

        const diffentOrderDetail = getDifferentGroupOrderFoodsByDate(
          orderDetail,
          oldOrderDetail,
          dateAsTimeStamp,
        );

        const totalDifferentQuantity = Object.keys(diffentOrderDetail).reduce(
          (result, date) => {
            const totalQuantity = Object.keys(
              diffentOrderDetail[date]?.memberOrders || {},
            );

            result += totalQuantity.length;

            return result;
          },
          0,
        );

        const { memberOrders: oldMemberOrders = {} } =
          oldOrderDetail?.[dateAsTimeStamp] || {};
        const snapshotTotalQuantity = Object.keys(oldMemberOrders).filter(
          (f) =>
            !!oldMemberOrders[f]?.foodId &&
            oldMemberOrders[f]?.status === EParticipantOrderStatus.joined,
        ).length;

        const newTotalQuantity = Object.keys(
          orderDetail[dateAsTimeStamp]?.memberOrders || {},
        ).filter(
          (f) =>
            !!memberOrders?.[f]?.foodId &&
            memberOrders?.[f]?.status === EParticipantOrderStatus.joined,
        ).length;

        const totalTimeCanChange =
          (snapshotTotalQuantity *
            +process.env.NEXT_PUBLIC_MAX_ORDER_DETAIL_MODIFIED_PERCENT) /
          100;
        const planReachMaxCanModify =
          totalDifferentQuantity > totalTimeCanChange;

        return {
          ...prev,
          [dateAsTimeStamp]: {
            planReachMinRestaurantQuantity:
              !isAdminFlow && newTotalQuantity < minQuantity,
            planReachMaxRestaurantQuantity:
              !isAdminFlow && newTotalQuantity > maxQuantity,
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
