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
import type { TListing, TObject } from '@utils/types';
import { addDays, min, subDays } from 'date-fns';
import isEmpty from 'lodash/isEmpty';
import { DateTime } from 'luxon';

export const isJoinedPlan = (
  foodId: string,
  status: EParticipantOrderStatus,
) => {
  return foodId !== '' && status === EParticipantOrderStatus.joined;
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
  const setUpDates = Object.keys(orderDetail);

  if (isEmpty(setUpDates)) {
    return startDate;
  }

  const suitableDateList = dateRange.filter(
    (date) => !setUpDates.includes(date.toString()),
  );
  const suitableStartDate = !isEmpty(suitableDateList)
    ? suitableDateList[0]
    : endDate;

  return suitableStartDate;
};
