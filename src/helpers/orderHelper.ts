import { addDays, min, subDays } from 'date-fns';
import difference from 'lodash/difference';
import isEmpty from 'lodash/isEmpty';
import uniq from 'lodash/uniq';
import { DateTime } from 'luxon';

import {
  AFTERNOON_SESSION,
  DINNER_SESSION,
  EVENING_SESSION,
  MORNING_SESSION,
} from '@components/CalendarDashboard/helpers/constant';
import type { TDaySession } from '@components/CalendarDashboard/helpers/types';
import { ETransition } from '@src/utils/transaction';
import { Listing } from '@utils/data';
import {
  generateTimeRangeItems,
  getDaySessionFromDeliveryTime,
  renderDateRange,
  weekDayFormatFromDateTime,
} from '@utils/dates';
import {
  EBookerOrderDraftStates,
  EEditOrderHistoryType,
  EFoodType,
  EOrderDraftStates,
  EOrderStates,
  EOrderType,
  EParticipantOrderStatus,
} from '@utils/enums';
import type { TPlan } from '@utils/orderTypes';
import type {
  TListing,
  TObject,
  TOrderChangeHistoryItem,
  TOrderStateHistory,
} from '@utils/types';

import { convertHHmmStringToTimeParts } from './dateHelpers';
import { parseThousandNumber } from './format';

export const ORDER_STATES_TO_ENABLE_EDIT_ABILITY = [
  EOrderDraftStates.pendingApproval,
  EOrderStates.picking,
  EOrderStates.inProgress,
];

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
    case EVENING_SESSION:
      return 'dinner';
    case AFTERNOON_SESSION:
      return 'lunch';

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
  const timeRangeOptions = generateTimeRangeItems({});
  const minStartTimeStamp = findMinStartDate().getTime();
  const minDeadlineTimeStamp = findMinDeadlineDate().getTime();
  const isNormalOrder = orderType === EOrderType.normal;
  const timeRangeOptionsValues = timeRangeOptions.map(({ key }) => key);

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
    isDeliveryHourValid: timeRangeOptionsValues.includes(deliveryHour),
    isDeadlineHourValid: isNormalOrder || !!deadlineHour,
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

    if (restaurantName && !result[restaurantName as string]) {
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

  const suitableStartDate =
    dateRange.find((date) => {
      const foodIds = Object.keys(
        orderDetail[date.toString()]?.restaurant?.foodList || {},
      );

      return isEmpty(foodIds);
    }) || new Date(startDate);

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

export const ORDER_STATE_TRANSIT_FLOW = {
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
      return EFoodType.vegetarianDish;
    case 'unVegetarian':
      return EFoodType.savoryDish;
    default:
      return '';
  }
};

export const mealTypeReverseAdapter = (mealType: string) => {
  switch (mealType) {
    case EFoodType.vegetarianDish:
      return 'vegetarian';
    case EFoodType.savoryDish:
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

export const preparePickingOrderChangeNotificationData = ({
  oldOrderDetail,
  newOrderDetail,
  order,
  updateOrderData,
}: {
  oldOrderDetail: TPlan['orderDetail'];
  newOrderDetail: TPlan['orderDetail'];
  order: TListing;
  updateOrderData: TObject;
}) => {
  const createdAt = new Date().getTime();

  const orderGetter = Listing(order);
  const orderId = orderGetter.getId();
  const {
    staffName,
    shipperName,
    specificPCCFee = 0,
    hasSpecificPCCFee = false,
    memberAmount = 0,
    deliveryAddress,
    detailAddress,
    deliveryHour,
  } = orderGetter.getMetadata();
  const PCCFeeByMemberAmount = getPCCFeeByMemberAmount(memberAmount);
  const PCCFeePerDate = hasSpecificPCCFee
    ? specificPCCFee
    : PCCFeeByMemberAmount;

  const changeHistoryToNotifyBooker: TObject[] = [];
  const changeHistoryToNotifyBookerByMeal: TObject = {};
  const emailParamsForParticipantNotification: TObject[] = [];
  const firebaseChangeHistory: Partial<TOrderChangeHistoryItem>[] = [];
  const normalizedOrderDetail: TObject = {};

  const sortedNewOrderDetailKeys = Object.keys(newOrderDetail).sort(
    (t1, t2) => Number(t1) - Number(t2),
  );

  sortedNewOrderDetailKeys.forEach((timestamp) => {
    const orderDetailData = newOrderDetail[timestamp] || {};
    const oldOrderDetailData = oldOrderDetail[timestamp] || {};
    changeHistoryToNotifyBookerByMeal[timestamp] = [];
    const formattedWeekDay = `${weekDayFormatFromDateTime(
      DateTime.fromMillis(Number(timestamp)),
    )}:`;

    const { restaurant = {}, memberOrders = {} } = orderDetailData;
    const { id: restaurantId, restaurantName, foodList = {} } = restaurant;
    const foodIds = Object.keys(foodList);
    const { restaurant: oldRestaurant = {} } = oldOrderDetailData;
    const {
      id: oldRestaurantId,
      restaurantName: oldRestaurantName,
      foodList: oldFoodList = {},
    } = oldRestaurant;
    const oldFoodIds = Object.keys(oldFoodList);
    const addedFoodList = difference(foodIds, oldFoodIds);
    const removedFoodList = difference(oldFoodIds, foodIds);

    changeHistoryToNotifyBookerByMeal[timestamp] = [];

    if (restaurantId && oldRestaurantId) {
      if (restaurantId !== oldRestaurantId) {
        // TODO: restaurant change for booker noti
        changeHistoryToNotifyBookerByMeal[timestamp] = [
          {
            oldData: {
              title: formattedWeekDay,
              content: `Đối tác - ${oldRestaurantName}`,
            },
            newData: {
              title: formattedWeekDay,
              content: `Đối tác - ${restaurantName}`,
            },
          },
        ];

        // TODO: firebase change history for restaurant change
        firebaseChangeHistory.push({
          orderId,
          type: EEditOrderHistoryType.changeRestaurant,
          createdAt,
          newValue: restaurant,
          oldValue: oldRestaurant,
          subOrderDate: timestamp,
        });
      } else {
        if (!isEmpty(removedFoodList)) {
          // TODO: add food for booker noti
          removedFoodList.forEach((removedFoodId) => {
            const { foodName } = oldFoodList[removedFoodId] || {};

            changeHistoryToNotifyBookerByMeal[timestamp] =
              changeHistoryToNotifyBookerByMeal[timestamp].concat({
                oldData: {},
                newData: {
                  title: formattedWeekDay,
                  content: `Xoá món "${foodName}"`,
                },
              });

            // TODO: firebase change history for removing food
            firebaseChangeHistory.push({
              orderId,
              type: EEditOrderHistoryType.deleteFood,
              createdAt,
              newValue: {},
              oldValue: { ...oldFoodList[removedFoodId] },
              subOrderDate: timestamp,
            });
          });
        }

        if (!isEmpty(addedFoodList)) {
          addedFoodList.forEach((addedFoodId) => {
            const { foodName } = foodList[addedFoodId] || {};

            // TODO: add food for booker noti
            changeHistoryToNotifyBookerByMeal[timestamp] =
              changeHistoryToNotifyBookerByMeal[timestamp].concat({
                oldData: {},
                newData: {
                  title: formattedWeekDay,
                  content: `Thêm món "${foodName}"`,
                },
              });

            // TODO: firebase change history for adding food
            firebaseChangeHistory.push({
              orderId,
              type: EEditOrderHistoryType.addFood,
              createdAt,
              newValue: { ...foodList[addedFoodId] },
              oldValue: {},
              subOrderDate: timestamp,
            });
          });
        }
      }
    }

    // TODO: picking changed for participant noti
    const normalizedMemberOrders = { ...memberOrders };
    Object.entries(memberOrders).forEach(([memberId, pickingFoodData]) => {
      const { foodId = '', ...restPickingData } = pickingFoodData || {};

      if (foodId !== '' && isEmpty(foodList[foodId])) {
        normalizedMemberOrders[memberId] = {
          ...restPickingData,
          foodId: '',
          status: EParticipantOrderStatus.empty,
        };
        emailParamsForParticipantNotification.push({
          orderId,
          participantId: memberId,
          timestamp,
        });
      }
    });

    if (!isEmpty(changeHistoryToNotifyBookerByMeal[timestamp])) {
      changeHistoryToNotifyBooker.push(
        ...changeHistoryToNotifyBookerByMeal[timestamp],
      );
    }

    normalizedOrderDetail[timestamp] = {
      ...newOrderDetail[timestamp],
      memberOrders: normalizedMemberOrders,
    };
  });

  const {
    staffName: updateStaffName,
    shipperName: updateShipperName,
    specificPCCFee: updateSpecificPCCFee,
    deliveryAddress: updateDeliveryAddress,
    detailAddress: updateDetailAddress,
    deliveryHour: updateDeliveryHour,
  } = updateOrderData || {};
  // TODO: change history for other fields
  if (updateStaffName !== undefined && updateStaffName !== staffName) {
    changeHistoryToNotifyBooker.push({
      oldData: {
        title: 'Nhân viên phụ trách:',
        content: staffName,
      },
      newData: {
        title: 'Nhân viên phụ trách:',
        content: updateStaffName,
      },
    });
  }
  if (updateShipperName !== undefined && updateShipperName !== shipperName) {
    changeHistoryToNotifyBooker.push({
      oldData: {
        title: 'Nhân viên giao hàng:',
        content: shipperName,
      },
      newData: {
        title: 'Nhân viên giao hàng:',
        content: updateShipperName,
      },
    });
  }
  if (
    updateSpecificPCCFee !== undefined &&
    PCCFeePerDate !== updateSpecificPCCFee
  ) {
    changeHistoryToNotifyBooker.push({
      oldData: {
        title: 'Phí PITO Cloud Canteen:',
        content: `${parseThousandNumber(PCCFeePerDate)}đ`,
      },
      newData: {
        title: 'Phí PITO Cloud Canteen:',
        content: `${parseThousandNumber(updateSpecificPCCFee)}đ`,
      },
    });
  }
  if (
    updateDeliveryAddress !== undefined &&
    updateDeliveryAddress.address !== deliveryAddress.address
  ) {
    changeHistoryToNotifyBooker.push({
      oldData: {
        title: 'Địa chỉ giao hàng:',
        content: deliveryAddress.address,
      },
      newData: {
        title: 'Địa chỉ giao hàng:',
        content: updateDeliveryAddress.address,
      },
    });
  }

  if (
    updateDetailAddress !== undefined &&
    updateDetailAddress !== detailAddress
  ) {
    changeHistoryToNotifyBooker.push({
      oldData: {
        title: 'Địa chỉ chi tiết:',
        content: detailAddress,
      },
      newData: {
        title: 'Địa chỉ chi tiết:',
        content: updateDetailAddress,
      },
    });
  }

  if (updateDeliveryHour !== undefined && updateDeliveryHour !== deliveryHour) {
    changeHistoryToNotifyBooker.push({
      oldData: {
        title: 'Thời gian giao hàng:',
        content: deliveryHour,
      },
      newData: {
        title: 'Thời gian giao hàng:',
        content: updateDeliveryHour,
      },
    });
  }

  return {
    emailParamsForBookerNotification: {
      changeHistory: changeHistoryToNotifyBooker,
      orderId,
    },
    emailParamsForParticipantNotification,
    firebaseChangeHistory,
    normalizedOrderDetail,
  };
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
  orderStateHistory: TOrderStateHistory[],
) => {
  return orderStateHistory.some(
    (state: TOrderStateHistory) => state.state === EOrderStates.inProgress,
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
        restaurant,
        hasNoRestaurants,
      };
    });
  }

  return mergedResult;
};

export const prepareOrderDeadline = (
  deadlineDate: number,
  deadlineHour: string,
) => {
  return DateTime.fromMillis(deadlineDate)
    .startOf('day')
    .plus({ ...convertHHmmStringToTimeParts(deadlineHour) })
    .toMillis();
};

export const prepareDaySession = (
  daySession: TDaySession,
  deliveryHour?: string,
) => {
  return (
    daySession ||
    getDaySessionFromDeliveryTime(
      isEmpty(deliveryHour)
        ? undefined
        : deliveryHour?.includes('-')
        ? deliveryHour?.split('-')[0]
        : deliveryHour,
    )
  );
};
