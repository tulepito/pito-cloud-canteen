import { addDays, min, subDays } from 'date-fns';
import isEmpty from 'lodash/isEmpty';
import uniq from 'lodash/uniq';
import { DateTime } from 'luxon';

import {
  AFTERNOON_SESSION,
  DINNER_SESSION,
  EVENING_SESSION,
  MORNING_SESSION,
} from '@components/CalendarDashboard/helpers/constant';
import { Listing } from '@utils/data';
import { generateTimeOptions, renderDateRange } from '@utils/dates';
import {
  EBookerOrderDraftStates,
  EFoodTypes,
  EOrderDraftStates,
  EOrderStates,
  EOrderType,
  EParticipantOrderStatus,
} from '@utils/enums';
import type { TPlan } from '@utils/orderTypes';
import type { TListing, TObject } from '@utils/types';

export const getParticipantPickingLink = (orderId: string) =>
  `${process.env.NEXT_PUBLIC_CANONICAL_URL}/participant/order/${orderId}`;
export const getTrackingLink = (orderId: string, timestamp: string | number) =>
  `${process.env.NEXT_PUBLIC_CANONICAL_URL}/tracking/${orderId}_${timestamp}`;

export const isJoinedPlan = (
  foodId: string,
  status: EParticipantOrderStatus,
) => {
  return foodId !== '' && status === EParticipantOrderStatus.joined;
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

export const isOver = (deadline: number = 0) => {
  return new Date().getTime() > deadline;
};

export const isOrderOverDeadline = (order: TListing) => {
  const { deadlineDate } = Listing(order).getMetadata();

  return isOver(deadlineDate);
};

export const findMinDeadlineDate = () => {
  return DateTime.fromJSDate(new Date())
    .plus({ days: 1 })
    .startOf('day')
    .toJSDate();
};

export const findMinStartDate = () => {
  const initMinStartDate = DateTime.fromJSDate(new Date())
    .startOf('day')
    .plus({ days: 3 });
  const { weekday } = initMinStartDate;

  const minStartDate =
    weekday === 6 || weekday === 7
      ? initMinStartDate.plus({ days: 7 - weekday + 1 })
      : initMinStartDate;

  return minStartDate.toJSDate();
};

export const findValidRangeForDeadlineDate = (
  startDateInitialValue?: Date | number,
) => {
  const today = new Date();
  const initMinSelectedDate = addDays(today, 1);

  const maxSelectedDate = startDateInitialValue
    ? subDays(startDateInitialValue, 2)
    : undefined;
  const minSelectedDate = min([
    maxSelectedDate || initMinSelectedDate,
    initMinSelectedDate,
  ]);

  return { minSelectedDate, maxSelectedDate };
};

export const deliveryDaySessionAdapter = (daySession: string) => {
  switch (daySession) {
    case MORNING_SESSION:
      return 'breakfast';
    case DINNER_SESSION:
      return 'dinner';
    case AFTERNOON_SESSION:
      return 'lunch';
    case EVENING_SESSION:
      return 'brunch';
    default:
      break;
  }
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

export const orderDataCheckers = (order: TListing) => {
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
  const timeOptions = generateTimeOptions();
  const minStartTimeStamp = findMinStartDate().getTime();
  const minDeadlineTimeStamp = findMinDeadlineDate().getTime();
  const isNormalOrder = orderType === EOrderType.normal;

  const checkers = {
    isDeadlineDateValid:
      isNormalOrder ||
      (Number.isInteger(deadlineDate) &&
        minDeadlineTimeStamp <= (deadlineDate || 0)),
    isDeliveryAddressValid:
      !isEmpty(deliveryAddress?.address) && !isEmpty(deliveryAddress?.origin),
    isStartDateValid:
      Number.isInteger(startDate) && minStartTimeStamp <= (startDate || 0),
    isEndDateValid:
      Number.isInteger(endDate) && (endDate || 0) >= (startDate || 0),
    isDeliveryHourValid: timeOptions.includes(deliveryHour),
    isDeadlineHourValid: isNormalOrder || timeOptions.includes(deadlineHour),
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
) => {
  const isOrderValid = orderDataCheckers(order).isAllValid;
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

export const isOrderDetailDatePickedFood = (date: any) => {
  const { foodList = [] } = date || {};

  return isEmpty(foodList);
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
          const { id, restaurantName, foodList } = restaurant;
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

    if (!result[restaurantName as string]) {
      // eslint-disable-next-line no-param-reassign
      result[restaurantName as string] = true;
    }

    return result;
  }, {});
};

export const findSuitableStartDate = ({
  selectedDate,
  startDate = new Date().getTime(),
  endDate = new Date().getTime(),
  orderDetail = {},
}: {
  selectedDate?: Date;
  startDate?: number;
  endDate?: number;
  orderDetail: TObject;
}) => {
  if (selectedDate && selectedDate instanceof Date) {
    return selectedDate;
  }

  const dateRange = renderDateRange(startDate, endDate);

  if (isEmpty(orderDetail)) {
    return startDate;
  }

  const suitableStartDate = dateRange.find((date) =>
    isOrderDetailDatePickedFood(orderDetail[date.toString()]),
  );

  return suitableStartDate;
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
  memberOrders,
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
        memberOrders,
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
  const { memberOrders, restaurant = {}, lineItems = [] } = data;
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

export const orderFlow = {
  [EOrderDraftStates.draft]: [
    EOrderDraftStates.pendingApproval,
    EOrderStates.canceled,
  ],
  [EBookerOrderDraftStates.bookerDraft]: [EOrderStates.canceled],
  [EOrderDraftStates.pendingApproval]: [
    EOrderStates.picking,
    EOrderStates.canceledByBooker,
    EOrderStates.canceled,
  ],
  [EOrderStates.picking]: [EOrderStates.inProgress, EOrderStates.canceled],
  [EOrderStates.inProgress]: [EOrderStates.pendingPayment],
  [EOrderStates.pendingPayment]: [EOrderStates.completed],
  [EOrderStates.completed]: [EOrderStates.reviewed],
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
  const currRestaurantId = currentRestaurant?.id?.uuid;
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
    id: currRestaurantId,
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

export const mealTypeAdapter = (mealType: string) => {
  switch (mealType) {
    case 'vegetarian':
      return EFoodTypes.vegetarianDish;
    case 'unVegetarian':
      return EFoodTypes.savoryDish;
    default:
      return '';
  }
};

export const mealTypeReverseAdapter = (mealType: string) => {
  switch (mealType) {
    case EFoodTypes.vegetarianDish:
      return 'vegetarian';
    case EFoodTypes.savoryDish:
      return 'unVegetarian';
    default:
      return '';
  }
};

export const calculateClientQuotation = (foodOrderGroupedByDate: any[]) => {
  return {
    quotation: foodOrderGroupedByDate.reduce((result: any, item: any) => {
      return {
        ...result,
        [item.date]: item.foodDataList,
      };
    }, {}),
  };
};

export const calculatePartnerQuotation = (
  groupByRestaurantQuotationData: TObject,
) => {
  return Object.keys(groupByRestaurantQuotationData).reduce((result, item) => {
    return {
      ...result,
      [item]: {
        name: groupByRestaurantQuotationData[item][0].restaurantName,
        quotation: groupByRestaurantQuotationData[item].reduce(
          (quotationArrayResult: any, quotationItem: any) => {
            return {
              ...quotationArrayResult,
              [quotationItem.date]: quotationItem.foodDataList,
            };
          },
          {},
        ),
      },
    };
  }, {});
};

export const getPickFoodParticipants = (orderDetail: TObject) => {
  const shouldSendNativeNotificationParticipantIdList = Object.entries(
    orderDetail,
  ).reduce<string[]>((acc, [, subOrder]: any) => {
    const { memberOrders } = subOrder;
    const memberHasPickFood = Object.keys(memberOrders).filter(
      (memberId: string) => {
        return memberOrders[memberId].foodId;
      },
    );

    return uniq([...acc, ...memberHasPickFood]);
  }, []);

  return shouldSendNativeNotificationParticipantIdList;
};
