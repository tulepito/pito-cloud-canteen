import { addDays, min, subDays } from 'date-fns';
import { isEmpty } from 'lodash';
import { DateTime } from 'luxon';

import type { TDaySession } from '@components/CalendarDashboard/helpers/types';
import { convertHHmmStringToTimeParts } from '@helpers/dateHelpers';
import {
  getDaySessionFromDeliveryTime,
  renderDateRange,
} from '@src/utils/dates';
import { EPartnerVATSetting } from '@src/utils/enums';
import type { TObject } from '@src/utils/types';

export const getParticipantPickingLink = (orderId: string) =>
  `${process.env.NEXT_PUBLIC_CANONICAL_URL}/participant/order/${orderId}`;

export const getTrackingLink = (orderId: string, timestamp: string | number) =>
  `${process.env.NEXT_PUBLIC_CANONICAL_URL}/tracking/${orderId}_${timestamp}`;

export const ensureVATSetting = (vatSetting: EPartnerVATSetting) =>
  vatSetting in EPartnerVATSetting ? vatSetting : EPartnerVATSetting.vat;

export const vatPercentageBaseOnVatSetting = ({
  vatSetting,
  vatPercentage,
  isPartner = true,
}: {
  vatSetting: EPartnerVATSetting;
  vatPercentage: number;
  isPartner?: boolean;
}) => {
  if (!isPartner) {
    return vatPercentage;
  }

  switch (vatSetting) {
    case EPartnerVATSetting.direct:
      return 0;
    case EPartnerVATSetting.noExportVat:
      return -0.04;
    case EPartnerVATSetting.vat:
    default:
      return vatPercentage;
  }
};

export const prepareOrderDeadline = (
  deadlineDate: number,
  deadlineHour: string,
) => {
  return DateTime.fromMillis(deadlineDate || 0)
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

export const findSuitableAnchorDate = ({
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
      return isEmpty(orderDetail[date.toString()]?.restaurant?.foodList || {});
    }) || new Date(startDate);

  return suitableStartDate;
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
