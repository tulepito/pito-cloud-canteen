import { addDays, min, subDays } from 'date-fns';
import isEmpty from 'lodash/isEmpty';
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
  EOrderDraftStates,
  EParticipantOrderStatus,
} from '@utils/enums';
import type { TPlan } from '@utils/orderTypes';
import type { TListing, TObject } from '@utils/types';

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
    const { memberOrders } = current;
    const { status, foodId } = memberOrders[participantId] || {};

    return result + +isJoinedPlan(foodId, status);
  }, 0);

  return completedDates === totalDates;
};

export const isOver = (deadline = 0) => {
  return new Date().getTime() > deadline;
};

export const isOrderOverDeadline = (order: TListing) => {
  const { deadlineDate } = Listing(order).getMetadata();

  return isOver(deadlineDate);
};

export const findMinStartDate = () => {
  const initMinStartDate = DateTime.fromJSDate(new Date()).plus({ days: 3 });
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
  } = Listing(order).getMetadata();
  const timeOptions = generateTimeOptions();

  const checkers = {
    isDeadlineDateValid: Number.isInteger(deadlineDate),
    isDeliveryAddressValid:
      !isEmpty(deliveryAddress?.address) && !isEmpty(deliveryAddress?.origin),
    isStartDateValid: Number.isInteger(startDate),
    isEndDateValid: Number.isInteger(endDate),
    isDeliveryHourValid: timeOptions.includes(deliveryHour),
    isDeadlineHourValid: timeOptions.includes(deadlineHour),
    isPackagePerMemberValid: Number.isInteger(packagePerMember),
    haveAnyPlans: !isEmpty(plans),
  };

  const isAllValid = Object.values(checkers).every((value) => value);

  return { ...checkers, isAllValid };
};

export const isEnableSubmitPublishOrder = (
  order: TListing,
  orderDetail: any[],
) => {
  const isOrderValid = orderDataCheckers(order).isAllValid;
  const isOrderDetailHasData = !isEmpty(orderDetail);
  const isOrderDetailSetupCompleted = orderDetail.every(({ resource }) => {
    const { isSelectedFood = false } = resource || {};

    return isSelectedFood;
  });

  return isOrderValid && isOrderDetailSetupCompleted && isOrderDetailHasData;
};

export const isOrderDetailDatePickedFood = (date: any) => {
  const { foodList = [] } = date || {};
  return isEmpty(foodList);
};

export const isEnableToStartOrder = (orderDetail: TPlan['orderDetail']) => {
  return (
    !isEmpty(orderDetail) &&
    Object.values(orderDetail).some(({ restaurant, memberOrders }) => {
      const { id, restaurantName, foodList } = restaurant;
      const isSetupRestaurant =
        !isEmpty(id) && !isEmpty(restaurantName) && !isEmpty(foodList);

      const hasAnyOrders = Object.values(memberOrders).some(
        ({ foodId, status }) => isJoinedPlan(foodId, status),
      );

      return isSetupRestaurant && hasAnyOrders;
    })
  );
};

export const getRestaurantListFromOrderDetail = (
  orderDetail: TPlan['orderDetail'],
) => {
  return Object.values(orderDetail).reduce((result: any, current) => {
    const { restaurant } = current;
    const { restaurantName } = restaurant;

    if (!result[restaurantName]) {
      // eslint-disable-next-line no-param-reassign
      result[restaurantName] = true;
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
