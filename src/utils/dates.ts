import {
  AFTERNOON_SESSION,
  DINNER_SESSION,
  EVENING_SESSION,
  MORNING_SESSION,
} from '@components/CalendarDashboard/helpers/constant';
import jstz from 'jstimezonedetect';
import type { DurationUnits } from 'luxon';
import { DateTime, Interval } from 'luxon';

import { EDayOfWeek } from './enums';

/**
 * Check if the browser's DateTimeFormat API supports time zones.
 *
 * @returns {Boolean} true if the browser returns current timezone.
 */
export const isTimeZoneSupported = () => {
  if (
    !Intl ||
    typeof Intl === 'undefined' ||
    typeof Intl.DateTimeFormat === 'undefined'
  ) {
    return false;
  }

  const dtf = new Intl.DateTimeFormat();
  if (
    typeof dtf === 'undefined' ||
    typeof dtf.resolvedOptions === 'undefined'
  ) {
    return false;
  }
  return !!dtf.resolvedOptions().timeZone;
};
/**
 * Detect the default timezone of user's browser.
 * This function can only be called from client side.
 * I.e. server-side rendering doesn't make sense - it would not return user's timezone.
 *
 * @returns {String} string containing IANA timezone key (e.g. 'Europe/Helsinki')
 */
export const getDefaultTimeZoneOnBrowser = () => {
  if (typeof window === 'undefined') {
    throw new Error(
      'Utility function: getDefaultTimeZoneOnBrowser() should be called on client-side only.',
    );
  }

  if (isTimeZoneSupported()) {
    const dtf = new Intl.DateTimeFormat();
    const currentTimeZone = dtf.resolvedOptions().timeZone;
    if (currentTimeZone) {
      return currentTimeZone;
    }
  }

  // Fallback to jstimezonedetect dependency.
  // However, most browsers support Intl.DateTimeFormat already.
  return jstz.determine().name();
};

export const weekDayFormatFromDateTime = (dateTime: DateTime) => {
  const { weekday: weekDay } = dateTime;
  let formattedWeekDay;

  switch (weekDay) {
    case 1: {
      formattedWeekDay = 'Thứ 2';
      break;
    }
    case 2: {
      formattedWeekDay = 'Thứ 3';

      break;
    }
    case 3: {
      formattedWeekDay = 'Thứ 4';

      break;
    }
    case 4: {
      formattedWeekDay = 'Thứ 5';

      break;
    }
    case 5: {
      formattedWeekDay = 'Thứ 6';

      break;
    }
    case 6: {
      formattedWeekDay = 'Thứ 7';

      break;
    }
    case 7: {
      formattedWeekDay = 'Chủ nhật';

      break;
    }
    default: {
      formattedWeekDay = 'Thứ 2';
      break;
    }
  }

  return formattedWeekDay;
};

export const parseTimestampToFormat = (date: number, format?: string) => {
  return DateTime.fromMillis(date).toFormat(format || 'dd/MM/yyyy', {
    locale: 'vi',
  });
};

export const addWeeksToDate = (dateObj: Date, numberOfWeeks: number) => {
  dateObj.setDate(dateObj.getDate() + numberOfWeeks * 7);
  return dateObj;
};

export const renderDateRange = (
  startDate = new Date().getTime(),
  endDate = new Date().getTime(),
) => {
  const result = [];
  let currentDate = new Date(startDate).getTime();

  while (currentDate <= endDate) {
    result.push(currentDate);
    currentDate = DateTime.fromMillis(currentDate).plus({ day: 1 }).toMillis();
  }

  return result;
};

export const generateTimeOptions = () => {
  let initHour = 6;
  let initMinute = 30;
  const options = [];
  while (initHour < 23) {
    while (initMinute < 60) {
      options.push(
        `${initHour.toString().padStart(2, '0')}:${initMinute
          .toString()
          .padStart(2, '0')}`,
      );
      initMinute += 15;
      if (initMinute === 60) {
        initMinute = 0;
        initHour += 1;
        break;
      }
    }
  }
  options.push('23:00');
  return options;
};

export const getDayInWeekFromPeriod = (start: number, end: number) => {
  if (!start || !end) return [];
  const startDateObj = new Date(start);
  const endDateObj = new Date(end);
  return Interval.fromDateTimes(
    DateTime.fromJSDate(startDateObj).startOf('day'),
    DateTime.fromJSDate(endDateObj).endOf('day'),
  )
    .splitBy({ days: 1 })
    .map((d) => d.start.weekday);
};

export const convertWeekDay = (weekDay: number) => {
  switch (weekDay) {
    case 1: {
      return { key: 'mon', label: 'DayInWeekField.mon' };
    }
    case 2: {
      return { key: 'tue', label: 'DayInWeekField.tue' };
    }
    case 3: {
      return { key: 'wed', label: 'DayInWeekField.wed' };
    }
    case 4: {
      return { key: 'thu', label: 'DayInWeekField.thu' };
    }
    case 5: {
      return { key: 'fri', label: 'DayInWeekField.fri' };
    }
    case 6: {
      return { key: 'sat', label: 'DayInWeekField.sat' };
    }
    case 7: {
      return { key: 'sun', label: 'DayInWeekField.sun' };
    }
    default: {
      return { key: 'mon', label: 'DayInWeekField.mon' };
    }
  }
};

export const getDaySessionFromDeliveryTime = (time: string = '6:30') => {
  const [hourStr, minuteStr] = time.split(':');
  const hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);
  const timeSecond = hour * 3600 + minute * 60;
  // 6:30 - 10:30
  if (timeSecond >= 23400 && timeSecond < 37800) {
    return MORNING_SESSION;
  }
  // 10:30 - 14:00
  if (timeSecond >= 37800 && timeSecond < 50400) {
    return AFTERNOON_SESSION;
  }
  // 14:00 - 16:30
  if (timeSecond >= 50400 && timeSecond < 59400) {
    return EVENING_SESSION;
  }

  // 16:30 - 23:00
  return DINNER_SESSION;
};

export const addDaysToDate = (date: Date, daysToAdd: number = 0) => {
  return DateTime.fromJSDate(date).plus({ days: daysToAdd }).toJSDate();
};

export const getStartOfWeek = () => {
  return DateTime.now().startOf('week').toJSDate();
};

export const DAY_AS_INDEX = {
  [EDayOfWeek.sun]: -1,
  [EDayOfWeek.mon]: 0,
  [EDayOfWeek.tue]: 1,
  [EDayOfWeek.wed]: 2,
  [EDayOfWeek.thu]: 3,
  [EDayOfWeek.fri]: 4,
  [EDayOfWeek.sat]: 5,
};

export const getDayOfWeekAsIndex = (day: EDayOfWeek) => {
  return DAY_AS_INDEX[day] === -1 ? 6 : DAY_AS_INDEX[day];
};

export const getDayOfWeekByIndex = (index: number) => {
  return Object.keys(DAY_AS_INDEX).find(
    (key) => DAY_AS_INDEX[key as EDayOfWeek] === index,
  ) as string;
};

export const diffDays = (
  date1 = new Date().getTime(),
  date2 = new Date().getTime(),
  units: DurationUnits = ['days'],
) => {
  return DateTime.fromMillis(date1).diff(DateTime.fromMillis(date2), units)
    .days;
};
