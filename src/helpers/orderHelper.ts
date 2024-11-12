import isEmpty from 'lodash/isEmpty';
import uniq from 'lodash/uniq';
import { DateTime } from 'luxon';

import { ETransition } from '@src/utils/transaction';
import { Listing } from '@utils/data';
import { generateTimeRangeItems, isOver, renderDateRange } from '@utils/dates';
import {
  EBookerOrderDraftStates,
  EOrderDraftStates,
  EOrderStates,
  EOrderType,
} from '@utils/enums';
import type { TFoodList, TPlan } from '@utils/orderTypes';
import type { TListing, TObject, TOrderStateHistoryItem } from '@utils/types';

import { isJoinedPlan } from './order/orderPickingHelper';
import {
  findDeliveryDate,
  findMinDeadlineDate,
  findMinStartDate,
} from './order/prepareDataHelper';

export const isOrderCreatedByBooker = (
  orderStateHistory: TOrderStateHistoryItem[],
) => {
  return orderStateHistory.some(
    ({ state }) => state === EBookerOrderDraftStates.bookerDraft,
  );
};

export const isCompletePickFood = ({
  participantId,
  orderDetail,
}: {
  participantId: string;
  orderDetail: TObject;
}) => {
  const allOrderDetails = Object.values<TObject>(orderDetail);
  const totalDates = allOrderDetails.length;

  const completedDates = allOrderDetails.reduce((result: number, current) => {
    const { memberOrders = {} } = current;
    const { status, foodId } = memberOrders[participantId] || {};

    return result + +isJoinedPlan(foodId, status);
  }, 0);

  return completedDates === totalDates;
};

export const isOrderOverDeadline = (order: TListing) => {
  const { deadlineDate } = Listing(order).getMetadata();

  return isOver(deadlineDate);
};

export const isEnableUpdateBookingInfo = (
  orderState: EBookerOrderDraftStates | EOrderDraftStates,
) => {
  return [
    EBookerOrderDraftStates.bookerDraft,
    EOrderDraftStates.draft,
    EOrderDraftStates.pendingApproval,
    EOrderStates.picking,
    EOrderStates.inProgress,
  ].includes(orderState);
};

export const orderDataCheckers = (
  order: TListing,
  skipValidateKeys: string[],
) => {
  const {
    plans = [],
    startDate,
    endDate,
    deliveryHour,
    deadlineHour,
    deadlineDate,
    packagePerMember,
    deliveryAddress,
    orderType,
  } = Listing(order).getMetadata();
  const timeRangeOptions = generateTimeRangeItems({});
  const minStartTimeStamp = findMinStartDate().getTime();
  const minDeadlineTimeStamp = findMinDeadlineDate().getTime();
  const isNormalOrder = orderType === EOrderType.normal;
  const timeRangeOptionsValues = timeRangeOptions.map(({ key }) => key);
  const newStartDate = findDeliveryDate(startDate, deliveryHour);

  const checkers = {
    isDeadlineDateValid:
      skipValidateKeys.includes('deadlineDate') ||
      isNormalOrder ||
      (Number.isInteger(deadlineDate) &&
        minDeadlineTimeStamp <= (deadlineDate || 0)),
    isDeliveryAddressValid:
      !isEmpty(deliveryAddress?.address) && !isEmpty(deliveryAddress?.origin),
    isStartDateValid:
      Number.isInteger(newStartDate) &&
      minStartTimeStamp <= (newStartDate || 0),
    isEndDateValid:
      Number.isInteger(endDate) && (endDate || 0) >= (startDate || 0),
    isDeliveryHourValid: timeRangeOptionsValues.includes(deliveryHour),
    isDeadlineHourValid:
      skipValidateKeys.includes('deadlineHour') ||
      isNormalOrder ||
      !!deadlineHour,
    isPackagePerMemberValid: Number.isInteger(packagePerMember),
    haveAnyPlans: !isEmpty(plans),
  };
  const isAllValid = Object.values(checkers).every((value) => value);

  return { ...checkers, isAllValid };
};

export const isEnableSubmitPublishOrder = (
  order: TListing,
  orderDetail: any[],
  availableOrderDetailCheckList: TObject,
  skipValidateKeys: string[] = [],
) => {
  const isOrderValid = orderDataCheckers(order, skipValidateKeys).isAllValid;
  const isOrderDetailHasData = !isEmpty(orderDetail);
  const isOrderDetailSetupCompleted = orderDetail.every(({ resource }) => {
    const { isSelectedFood = false } = resource || {};

    return isSelectedFood;
  });
  const isNoUnAvailableRestaurantInOrderDetail = Object.keys(
    availableOrderDetailCheckList,
  ).every((item) => availableOrderDetailCheckList[item].isAvailable);

  return (
    isOrderValid &&
    isOrderDetailSetupCompleted &&
    isOrderDetailHasData &&
    isNoUnAvailableRestaurantInOrderDetail
  );
};

export const isOrderDetailDatePickedFood = (orderDetailOnDate: any) => {
  const { restaurant = {} } = orderDetailOnDate || {};
  const { foodList = [], id } = restaurant || {};

  return !isEmpty(id) && !isEmpty(foodList);
};

export const isEnableToStartOrder = (
  orderDetail: TPlan['orderDetail'],
  isGroupOrder = true,
  isAdminFlow = false,
) => {
  if (isEmpty(orderDetail)) return false;

  return isGroupOrder
    ? Object.values(orderDetail).some(
        ({ restaurant, memberOrders, lineItems = [] }) => {
          const { id, restaurantName, foodList } = restaurant || {};
          const isSetupRestaurant =
            !isEmpty(id) && !isEmpty(restaurantName) && !isEmpty(foodList);

          const hasAnyOrders = Object.values(memberOrders).some(
            ({ foodId, status }) => isJoinedPlan(foodId, status),
          );

          const hasAnyLineItems =
            lineItems.reduce((totalQuantity: number, item: TObject) => {
              return totalQuantity + (item?.quantity || 0);
            }, 0) > 0;

          return isSetupRestaurant && isGroupOrder
            ? hasAnyOrders
            : hasAnyLineItems;
        },
      )
    : Object.values(orderDetail).every(({ restaurant, lineItems = [] }) => {
        const {
          id,
          restaurantName,
          foodList,
          minQuantity = 0,
          maxQuantity = 100,
        } = restaurant || {};
        const isSetupRestaurant =
          !isEmpty(id) && !isEmpty(restaurantName) && !isEmpty(foodList);

        const quantity = lineItems.reduce(
          (totalQuantity: number, item: TObject) => {
            return totalQuantity + (item?.quantity || 1);
          },
          0,
        );
        const isQuantityValid =
          quantity >= minQuantity && quantity <= maxQuantity;

        return isSetupRestaurant && (isQuantityValid || isAdminFlow);
      });
};

export const getRestaurantListFromOrderDetail = (
  orderDetail: TPlan['orderDetail'],
) => {
  return Object.values(orderDetail).reduce((result: any, current) => {
    const { restaurant } = current;
    const { restaurantName } = restaurant || {};

    if (restaurantName && !result[restaurantName as string]) {
      // eslint-disable-next-line no-param-reassign
      result[restaurantName as string] = true;
    }

    return result;
  }, {});
};

export const isOrderDetailFullDatePickingRestaurant = ({
  startDate = new Date().getTime(),
  endDate = new Date().getTime(),
  orderDetail = {},
}: {
  startDate?: number;
  endDate?: number;
  orderDetail: TObject;
}) => {
  const dateRange = renderDateRange(startDate, endDate);
  const selectedDate = Object.keys(orderDetail);

  return dateRange.length === selectedDate.length;
};

export const isOrderDetailFullDatePickingFood = (orderDetail: TObject) => {
  return Object.values(orderDetail).every((date) => {
    const { foodList = [] } = date || {};

    return !isEmpty(foodList);
  });
};

type TFoodDataValue = {
  foodId: string;
  foodName: string;
  foodPrice: number;
  frequency: number;
};

type TFoodDataMap = TObject<string, TFoodDataValue>;

export const getFoodDataMap = ({
  foodListOfDate = {},
  memberOrders = {},
  orderType = EOrderType.group,
  lineItems = [],
}: any) => {
  if (orderType === EOrderType.group) {
    return Object.entries(memberOrders).reduce<TFoodDataMap>(
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
  }

  return lineItems.reduce((result: any, item: any) => {
    const { id, name, quantity, unitPrice } = item;

    return {
      ...result,
      [id]: {
        foodId: id,
        foodName: name,
        foodPrice: unitPrice,
        frequency: quantity,
      },
    };
  }, {} as TFoodDataMap) as TFoodDataMap;
};

export const getTotalInfo = (foodDataList: TFoodDataValue[]) => {
  return foodDataList.reduce<{
    totalPrice: number;
    totalDishes: number;
  }>(
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
};

export const combineOrderDetailWithPriceInfo = ({
  orderDetail = {},
  orderType = EOrderType.group,
}: {
  orderDetail: TObject;
  orderType?: EOrderType;
}) => {
  return Object.entries<TObject>(orderDetail).reduce<TObject>(
    (result, currentOrderDetailEntry) => {
      const [date, rawOrderDetailOfDate] = currentOrderDetailEntry;
      const {
        memberOrders = {},
        restaurant = {},
        lineItems = [],
      } = rawOrderDetailOfDate;
      const { foodList: foodListOfDate } = restaurant;
      const foodDataMap = getFoodDataMap({
        foodListOfDate,
        memberOrders,
        orderType,
        lineItems,
      });
      const foodDataList = Object.values(foodDataMap);
      const totalInfo = getTotalInfo(foodDataList);

      return {
        ...result,
        [date]: {
          ...rawOrderDetailOfDate,
          totalPrice: totalInfo.totalPrice,
          totalDishes: totalInfo.totalDishes,
        },
      };
    },
    {},
  );
};

export const calculateSubOrderPrice = ({
  data,
  orderType = EOrderType.group,
}: {
  data: TObject;
  orderType?: EOrderType;
}) => {
  const isGroupOrder = orderType === EOrderType.group;
  const { memberOrders = {}, restaurant = {}, lineItems = [] } = data;
  const { foodList: foodListOfDate } = restaurant;

  if (isGroupOrder) {
    const foodDataMap = getFoodDataMap({ foodListOfDate, memberOrders });
    const foodDataList = Object.values(foodDataMap);
    const totalInfo = getTotalInfo(foodDataList);

    return {
      totalPrice: totalInfo.totalPrice,
      totalDishes: totalInfo.totalDishes,
    };
  }

  return lineItems.reduce(
    (
      res: {
        totalPrice: number;
        totalDishes: number;
      },
      item: TObject,
    ) => {
      const { quantity = 1, price = 0 } = item || {};

      return {
        totalPrice: res.totalPrice + price,
        totalDishes: res.totalDishes + quantity,
      };
    },
    { totalPrice: 0, totalDishes: 0 },
  );
};

export const getPCCFeeByMemberAmount = (memberAmount: number) => {
  if (memberAmount === 0) {
    return 0;
  }
  if (memberAmount < 30) {
    return 70000;
  }
  if (memberAmount < 45) {
    return 150000;
  }
  if (memberAmount < 60) {
    return 140000;
  }
  if (memberAmount < 75) {
    return 200000;
  }
  if (memberAmount < 105) {
    return 230000;
  }
  if (memberAmount < 130) {
    return 250000;
  }

  return 500000;
};

export const markColorForOrder = (orderNumber: number) => {
  const colorList = ['#65DB63', '#CF1332', '#FFB13D', '#2F54EB', '#171760'];

  return colorList[orderNumber % colorList.length];
};

export const getSelectedRestaurantAndFoodList = ({
  foodList = [],
  foodIds = [],
  currentRestaurant,
}: {
  foodList: TObject[];
  foodIds: string[];
  currentRestaurant: TObject;
}) => {
  const submitFoodListData = foodIds.reduce((result, foodId) => {
    const item = foodList.find((food) => food?.id?.uuid === foodId);

    if (isEmpty(item)) {
      return result;
    }
    const { id, attributes } = item || {};
    const { title, price } = attributes;
    const foodUnit = attributes?.publicData?.unit || '';

    return id?.uuid
      ? {
          ...result,
          [id?.uuid]: {
            foodName: title,
            foodPrice: price?.amount || 0,
            foodUnit,
          },
        }
      : result;
  }, {});

  const submitRestaurantData = {
    id: currentRestaurant?.id?.uuid,
    restaurantName: currentRestaurant?.attributes?.title,
    phoneNumber: currentRestaurant?.attributes?.publicData?.phoneNumber,
    minQuantity: currentRestaurant?.attributes?.publicData?.minQuantity,
    maxQuantity: currentRestaurant?.attributes?.publicData?.maxQuantity,
  };

  return {
    submitRestaurantData,
    submitFoodListData,
  };
};

export const getPickFoodParticipants = (orderDetail: TObject) => {
  const shouldSendNativeNotificationParticipantIdList = Object.entries(
    orderDetail,
  ).reduce<string[]>((acc, [, subOrder]: any) => {
    const { memberOrders = {} } = subOrder;
    const memberHasPickFood = Object.keys(memberOrders).filter(
      (memberId: string) => {
        return memberOrders[memberId].foodId;
      },
    );

    return uniq([...acc, ...memberHasPickFood]);
  }, []);

  return shouldSendNativeNotificationParticipantIdList;
};

export const getUpdateLineItems = (foodList: any[], foodIds: string[]) => {
  const updateFoodList = foodIds.reduce((acc: any, foodId: string) => {
    const food = foodList?.find((item) => item.id?.uuid === foodId);
    if (food) {
      const foodListingGetter = Listing(food).getAttributes();

      acc[foodId] = {
        foodName: foodListingGetter.title,
        foodPrice: foodListingGetter.price?.amount || 0,
        foodUnit: foodListingGetter.publicData?.unit || '',
      };
    }

    return acc;
  }, {});

  const updateLineItems = Object.entries<{
    foodName: string;
    foodPrice: number;
  }>(updateFoodList).map(([foodId, { foodName, foodPrice }]) => {
    return {
      id: foodId,
      name: foodName,
      unitPrice: foodPrice,
      price: foodPrice,
      quantity: 1,
    };
  });

  return updateLineItems;
};

export const getEditedSubOrders = (orderDetail: TObject) => {
  const editedSubOrders = Object.keys(orderDetail).reduce(
    (result: any, subOrderDate: string) => {
      const { oldValues, lastTransition } = orderDetail[subOrderDate];
      if (
        isEmpty(oldValues) ||
        lastTransition !== ETransition.INITIATE_TRANSACTION
      ) {
        return result;
      }

      return {
        ...result,
        [subOrderDate]: orderDetail[subOrderDate],
      };
    },
    {},
  );

  return editedSubOrders;
};

export const checkIsOrderHasInProgressState = (
  orderStateHistory: TOrderStateHistoryItem[],
) => {
  return orderStateHistory.some(
    (state: TOrderStateHistoryItem) => state.state === EOrderStates.inProgress,
  );
};

export const mergeRecommendOrderDetailWithCurrentOrderDetail = (
  currentOrderDetail: TObject,
  recommendOrderDetail: TObject,
  timestamp?: string,
) => {
  let mergedResult: TObject = {};

  if (timestamp) {
    mergedResult = { ...currentOrderDetail };
    mergedResult[timestamp] = {
      ...currentOrderDetail[timestamp],
      ...recommendOrderDetail[timestamp],
    };
  } else {
    mergedResult = { ...recommendOrderDetail };

    Object.keys(currentOrderDetail).forEach((time) => {
      const { restaurant = {}, hasNoRestaurants = false } =
        recommendOrderDetail[time] || {};

      mergedResult[time] = {
        ...currentOrderDetail[time],
        restaurant: isEmpty(restaurant)
          ? currentOrderDetail[time].restaurant
          : restaurant,
        hasNoRestaurants,
      };
    });
  }

  return mergedResult;
};

export const initLineItemsFromFoodList = (
  foodList: TFoodList,
  isNormalOrder = true,
) => {
  return isNormalOrder
    ? Object.entries<{
        foodName: string;
        foodPrice: number;
      }>(foodList).map(([foodId, { foodName, foodPrice }]) => {
        return {
          id: foodId,
          name: foodName,
          unitPrice: foodPrice,
          price: foodPrice,
          quantity: 1,
        };
      })
    : [];
};

export const sortCreateAtListing = (
  listings: TListing[],
  sortBy: 'asc' | 'desc',
) => {
  return listings.sort((previous: TListing, current: TListing) => {
    const { createdAt: previousCreatedAt } = Listing(previous).getAttributes();
    const { createdAt: currentCreatedAt } = Listing(current).getAttributes();
    const timestampPrevious: number = Date.parse(previousCreatedAt);
    const timestampCurrent: number = Date.parse(currentCreatedAt);
    if (timestampPrevious < timestampCurrent) {
      return sortBy === 'asc' ? -1 : 1;
    }
    if (timestampPrevious > timestampCurrent) {
      return sortBy === 'asc' ? 1 : -1;
    }

    return 0;
  });
};

export const confirmFirstTimeParticipant = (
  order: TListing,
  participantId: string,
) => {
  const { orderState, deadlineDate, ...restMetadata } =
    Listing(order).getMetadata();
  if (orderState === EOrderStates.picking) {
    const expiredTime = deadlineDate
      ? DateTime.fromMillis(+deadlineDate)
      : null;
    const isParticipantViewedOrderFirstTime =
      restMetadata?.[`hideFirstTimeOrderModal_${participantId}`];
    if (
      expiredTime &&
      !isOver(expiredTime.toMillis()) &&
      !isParticipantViewedOrderFirstTime
    ) {
      return false;
    }
  }

  return true;
};
