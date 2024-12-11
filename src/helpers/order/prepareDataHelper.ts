import { addDays, min, subDays } from 'date-fns';
import { isEmpty } from 'lodash';
import { DateTime } from 'luxon';

import { SESSION_TIMES } from '@components/CalendarDashboard/helpers/constant';
import type {
  EDaySession,
  TDaySession,
} from '@components/CalendarDashboard/helpers/types';
import { convertHHmmStringToTimeParts } from '@helpers/dateHelpers';
import { QUERY_REFS } from '@src/utils/constants';
import {
  getDaySessionFromDeliveryTime,
  renderDateRange,
} from '@src/utils/dates';
import { EPartnerVATSetting } from '@src/utils/enums';
import type { TObject } from '@src/utils/types';

export const getParticipantPickingLink = ({
  orderId,
  companyId,
}: {
  orderId: string;
  companyId?: string;
}) => {
  const baseUrl = `${process.env.NEXT_PUBLIC_CANONICAL_URL}/invitation/${orderId}`;

  const searchString = new URLSearchParams();
  searchString.append('ref', QUERY_REFS.INVITATION_LINK);
  if (companyId) {
    searchString.append('companyId', companyId);
  }

  const query = searchString.toString();

  const url = new URL(baseUrl);
  url.search = query;

  return url.toString();
};

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
  const now = DateTime.now();

  const minStartDate = now
    .plus({ hours: +process.env.NEXT_PUBLIC_ORDER_MINIMUM_TIME })
    .startOf('minute'); // Cộng thêm 15 tiếng từ giờ hiện tại và lấy phút đầu tiên của giờ

  return minStartDate.toJSDate();
};

export const adjustMinDateWithDaySession = ({
  minDate,
  session,
}: {
  minDate?: Date | null;
  session?: EDaySession;
}) => {
  const minDateOrigin = minDate || findMinStartDate();

  if (!session) {
    return minDateOrigin;
  }

  let minDateTime = DateTime.fromJSDate(minDateOrigin);

  const sessionStartTime = SESSION_TIMES[session].START;

  const startSession = minDateTime.set({
    hour: parseInt(sessionStartTime.split(':')[0], 10),
    minute: parseInt(sessionStartTime.split(':')[1], 10),
  });

  if (minDateTime > startSession) {
    //  Add 1 day and set to 00:00 of the next day
    minDateTime = minDateTime.plus({ days: 1 }).startOf('day');
  }

  return minDateTime.toJSDate();
};

/**
 * Get delivery date from start date and delivery hour
 * @example findDeliveryDate(1629936000000, '10:00-11:00') => 1629961200000
 */
export const findDeliveryDate = (
  startDateParameter?: number,
  deliveryHourParameter?: string,
) => {
  if (!startDateParameter || !deliveryHourParameter) {
    return undefined;
  }

  const date = new Date(startDateParameter);

  const [startTime] = deliveryHourParameter.split('-');
  const [hour, minute] = startTime.split(':');

  date.setHours(date.getHours() + parseInt(hour, 10));
  date.setMinutes(date.getMinutes() + parseInt(minute, 10));

  return date.getTime();
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
