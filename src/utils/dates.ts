import { formatDistanceToNow } from 'date-fns';
import jstz from 'jstimezonedetect';
import { capitalize } from 'lodash';
import difference from 'lodash/difference';
import differenceBy from 'lodash/differenceBy';
import type { DurationUnits, LocaleOptions } from 'luxon';
import { DateTime, Interval } from 'luxon';

import {
  AFTERNOON_SESSION,
  DINNER_SESSION,
  EVENING_SESSION,
  MORNING_SESSION,
} from '@components/CalendarDashboard/helpers/constant';
import { EDaySession } from '@components/CalendarDashboard/helpers/types';
import {
  getCurrentLocaleFromLocalStorage,
  getLocaleTimeProvider,
} from '@src/translations/TranslationProvider';

import { DAY_IN_WEEK } from './constants';
import { getUniqueString } from './data';
import type { ETimeFrame } from './enums';
import { EDayOfWeek, EMenuMealType } from './enums';
import type { TKeyValue } from './types';

export const VNTimezone = 'Asia/Ho_Chi_Minh';

export const isOver = (deadline: number = 0) => {
  return new Date().getTime() > deadline;
};

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
  // const { weekday: weekDay } = dateTime;
  const locale = getCurrentLocaleFromLocalStorage();
  const weekDayFormat = dateTime.toFormat('cccc', {
    locale,
  });

  return weekDayFormat;
  // let formattedWeekDay;

  // switch (weekDay) {
  //   case 1: {
  //     formattedWeekDay = 'Thứ 2';
  //     break;
  //   }
  //   case 2: {
  //     formattedWeekDay = 'Thứ 3';

  //     break;
  //   }
  //   case 3: {
  //     formattedWeekDay = 'Thứ 4';

  //     break;
  //   }
  //   case 4: {
  //     formattedWeekDay = 'Thứ 5';

  //     break;
  //   }
  //   case 5: {
  //     formattedWeekDay = 'Thứ 6';

  //     break;
  //   }
  //   case 6: {
  //     formattedWeekDay = 'Thứ 7';

  //     break;
  //   }
  //   case 7: {
  //     formattedWeekDay = 'Chủ nhật';

  //     break;
  //   }
  //   default: {
  //     formattedWeekDay = 'Thứ 2';
  //     break;
  //   }
  // }

  // return formattedWeekDay;
};

export const formatTimestamp = (
  date = new Date().getTime(),
  format?: string,
  _locale: LocaleOptions['locale'] = 'vi',
  timeZone: string = VNTimezone,
) => {
  return DateTime.fromMillis(Number(date))
    .setZone(timeZone)
    .toFormat(format || 'dd/MM/yyyy', {
      locale: getCurrentLocaleFromLocalStorage(),
    });
};

export const formatDate = (
  date = new Date(),
  format?: string,
  _locale: LocaleOptions['locale'] = 'vi',
  timeZone: string = VNTimezone,
) => {
  return DateTime.fromJSDate(date)
    .setZone(timeZone)
    .toFormat(format || 'dd/MM/yyyy', {
      locale: getCurrentLocaleFromLocalStorage(),
    });
};

export const addWeeksToDate = (dateObj: Date, numberOfWeeks: number) => {
  const weekToAdd = numberOfWeeks * 7 - 1;
  dateObj.setDate(dateObj.getDate() + weekToAdd);

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
    currentDate = DateTime.fromMillis(currentDate)
      .setZone(VNTimezone)
      .plus({ day: 1 })
      .toMillis();
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

export const findEndDeliveryTime = (time = '6:30') => {
  const [hour, min] = time.split(':');
  const numHour = Number(hour) + 1;

  return `${numHour > 24 ? 0 : numHour}:${min}`;
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

export const getDeliveryTimeFromMealType = (mealType: EMenuMealType) => {
  // 6:30 - 10:30
  if (mealType === EMenuMealType.breakfast) {
    return '06:30';
  }
  // 10:30 - 14:00
  if (mealType === EMenuMealType.lunch) {
    return '10:30';
  }
  // 14:00 - 16:30
  if (mealType === EMenuMealType.snack) {
    return '14:00';
  }

  // 16:30 - 23:00
  return '16:30';
};

export const addDaysToDate = (date: Date, daysToAdd: number = 0) => {
  return DateTime.fromJSDate(date).plus({ days: daysToAdd }).toJSDate();
};

export const getStartOfWeek = (anchorDate: number) => {
  return DateTime.fromMillis(anchorDate).startOf('week').toJSDate();
};

export const getStartOfDay = (anchorDate: number) => {
  return DateTime.fromMillis(anchorDate).startOf('day').second;
};

export const getDateEndDate = (date: Date) =>
  DateTime.fromJSDate(date).endOf('day').toJSDate();
export const getDateStartOfDate = (date: Date) =>
  DateTime.fromJSDate(date).startOf('day').toJSDate();

export const DAY_AS_INDEX = {
  [EDayOfWeek.sun]: -1,
  [EDayOfWeek.mon]: 0,
  [EDayOfWeek.tue]: 1,
  [EDayOfWeek.wed]: 2,
  [EDayOfWeek.thu]: 3,
  [EDayOfWeek.fri]: 4,
  [EDayOfWeek.sat]: 5,
};

const DAYS_OF_WEEK_SORTER = {
  [EDayOfWeek.sun]: 6,
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
  return DateTime.fromMillis(date1).diff(DateTime.fromMillis(date2), units);
};

export const printHoursToString = (hours: number, minutes: number) => {
  const minutesToRender = minutes < 10 ? `0${minutes}` : minutes;
  const hoursToRender = hours < 10 ? `0${hours}` : hours;
  const hoursAndMinutes = `${hoursToRender}:${minutesToRender}`;

  return hoursAndMinutes;
};

const DAYS = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

export const addDays = (d: Date, days: number) => {
  const date = new Date(d);
  date.setDate(date.getDate() + days);

  return date;
};

export const getDates = (startDate: Date, stopDate: Date) => {
  const dateArray = [];
  let currentDate = DateTime.fromJSDate(startDate)
    .setZone(VNTimezone)
    .startOf('day')
    .toJSDate();
  while (currentDate <= stopDate) {
    dateArray.push(currentDate);
    currentDate = DateTime.fromJSDate(currentDate)
      .setZone(VNTimezone)
      .plus({ day: 1 })
      .toJSDate();
  }

  return dateArray;
};

export const findClassDays = (
  daysOfWeek: string[],
  firstDay: Date,
  lastDay: Date,
) => {
  let classDays = [];
  const rangeDates = getDates(new Date(firstDay), new Date(lastDay)) || [];
  const daysOfWeekUpperCase = daysOfWeek.map((d) => capitalize(d));

  classDays = rangeDates.filter((f) => {
    const weekdayIdx = DateTime.fromJSDate(f).setZone(VNTimezone).weekday % 7;

    return daysOfWeekUpperCase.some((d) => {
      return DAYS[d as keyof typeof DAYS] === weekdayIdx;
    });
  });

  return classDays.map((d) => d.getTime());
};

const sortDatesByDayOfWeek = (dates: Date[]) => {
  return dates.sort((a, b) => {
    const aDayOfWeek = getDayOfWeekByIndex(a.getDay() - 1);
    const bDayOfWeek = getDayOfWeekByIndex(b.getDay() - 1);

    const aDayOfWeekSorter = DAYS_OF_WEEK_SORTER[aDayOfWeek as EDayOfWeek];
    const bDayOfWeekSorter = DAYS_OF_WEEK_SORTER[bDayOfWeek as EDayOfWeek];

    return aDayOfWeekSorter - bDayOfWeekSorter;
  });
};

export const getWeekDayList = (startDate: Date, endDate: Date) => {
  const days = [];
  const end = new Date(endDate);
  for (
    let start = new Date(startDate);
    start <= end;
    start.setDate(start.getDate() + 1)
  ) {
    days.push(new Date(start));
  }

  const sortedDates = sortDatesByDayOfWeek(days);

  const results = sortedDates.map((day) =>
    getDayOfWeekByIndex(new Date(day).getDay() - 1),
  );

  return getUniqueString(results);
};

export const getSelectedDaysOfWeek = (
  startDate: number,
  endDate: number,
  dayInWeek: string[],
) => {
  const dayInWeekFromStartDateToEndDate = getDayInWeekFromPeriod(
    startDate,
    endDate,
  ).map((day) => convertWeekDay(day));
  const disableDayInWeekOptions = differenceBy(
    DAY_IN_WEEK,
    dayInWeekFromStartDateToEndDate,
    'key',
  );
  const selectedDays = difference(
    dayInWeek,
    disableDayInWeekOptions.map((day) => day.key),
  );

  return selectedDays;
};

const units: Intl.RelativeTimeFormatUnit[] = [
  'year',
  'month',
  'week',
  'day',
  'hour',
  'minute',
  'second',
];

export const timeAgo = (date: Date) => {
  const dateTime = DateTime.fromJSDate(date);
  const diff = dateTime.diffNow().shiftTo(...units);
  const unit = units.find((u: any) => diff.get(u) !== 0) || 'second';

  const relativeFormatter = new Intl.RelativeTimeFormat(
    getCurrentLocaleFromLocalStorage(),
    {
      numeric: 'auto',
    },
  );

  return relativeFormatter.format(Math.trunc(diff.as(unit)), unit);
};

export const minusDays = (date: Date, days: number) => {
  return DateTime.fromJSDate(date).minus({ days }).toJSDate();
};

export const calculateRemainTime = (futureTimestamp = new Date().getTime()) => {
  const futureTime = DateTime.fromMillis(futureTimestamp);

  // Get the current time as a DateTime object
  const currentTime = DateTime.local();

  // Calculate the remaining time as a Duration object
  const remainingTime = futureTime.diff(currentTime);

  // Format the remaining time as a string
  return remainingTime.toFormat('hh:mm:ss');
};

export const isSameDate = (date1: Date, date2: Date) => {
  return DateTime.fromJSDate(date1).hasSame(DateTime.fromJSDate(date2), 'day');
};

export const calcPastTime = (timestamp: number) => {
  const pastDt = DateTime.fromMillis(timestamp);
  const diff = formatDistanceToNow(pastDt.toJSDate(), {
    addSuffix: true,
    locale: getLocaleTimeProvider(),
  });

  return diff;
};
export const getDayOfWeek = (timestamp: number) => {
  return DateTime.fromMillis(timestamp).setZone(VNTimezone).weekday;
};

export const getStartDayOfWeek = (currentDate: Date, startDay: number = 1) => {
  const dayOfWeek = currentDate.getDay();
  const diff = (dayOfWeek - startDay + 7) % 7;
  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - diff);
  startOfWeek.setHours(0, 0, 0, 0);

  return startOfWeek;
};

export const getEndDayOfWeek = (currentDate: Date, startDay: number = 1) => {
  const startOfWeek = getStartDayOfWeek(currentDate, startDay);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() - startDay + 7);
  endOfWeek.setHours(0, 0, 0, 0);

  return endOfWeek;
};

export const getNextMonth = (date: Date) => {
  return DateTime.fromJSDate(date)
    .plus({ months: 1 })
    .startOf('month')
    .toJSDate();
};

export const getPrevMonth = (date: Date) => {
  return DateTime.fromJSDate(date)
    .minus({ months: 1 })
    .startOf('month')
    .toJSDate();
};

export const getStartOfMonth = (date: Date) => {
  return DateTime.fromJSDate(date)
    .setZone(VNTimezone)
    .startOf('month')
    .toJSDate();
};

export const getEndOfMonth = (date: Date) => {
  return DateTime.fromJSDate(date)
    .setZone(VNTimezone)
    .endOf('month')
    .toJSDate();
};

export const renderListTimeOptions = ({
  startTime = '06:30',
  endTime = '23:00',
  interval = 15,
  isToday = false,
}: {
  startTime?: string;
  endTime?: string;
  interval?: number;
  isToday?: boolean;
}) => {
  const [startHour, startMinute] = startTime?.split(':') || [];
  const [endHour, endMinute] = endTime?.split(':') || [];
  const startInterval = Number(startHour) * 60 + Number(startMinute);
  const endInterval = Number(endHour) * 60 + Number(endMinute);
  const result = [];

  const today = new Date();
  const currentHour = today.getHours();
  const currentMinute = today.getMinutes();
  const currentInterval = 60 * currentHour + currentMinute;

  for (let i = startInterval; i <= endInterval; i += interval) {
    if (isToday && startInterval <= currentInterval) {
      // eslint-disable-next-line no-continue
      continue;
    }

    const hours = Math.floor(i / 60);
    const minutes = i % 60;

    const timeIn24HourClock = `${hours}:${minutes}`.replace(/\b\d\b/g, '0$&');

    const timeIn12HourClock = `${hours % 12 || 12}:${minutes} ${
      'AP'[+(hours > 11)]
    }M`.replace(/\b\d\b/g, '0$&');

    result.push({
      label: timeIn12HourClock,
      key: timeIn24HourClock,
    });
  }

  return result;
};

export const generateTimeRangeItems = ({
  startTime = '06:30',
  endTime = '23:00',
  interval = 1,
  daySession,
}: {
  startTime?: string;
  endTime?: string;
  interval?: number;
  daySession?: EDaySession;
}): TKeyValue[] => {
  const timeRangeItems: TKeyValue[] = [];

  // Set default start and end times based on the selected session
  if (daySession) {
    switch (daySession) {
      case EDaySession.MORNING_SESSION:
        startTime = '06:30';
        endTime = '10:00';
        break;
      case EDaySession.AFTERNOON_SESSION:
        startTime = '10:00';
        endTime = '15:00';
        break;
      case EDaySession.EVENING_SESSION:
      case EDaySession.DINNER_SESSION:
        startTime = '15:00';
        endTime = '21:00';
        break;
      default:
        startTime = startTime || '06:30';
        endTime = endTime || '23:00';
    }
  } else {
    startTime = startTime || '06:30';
    endTime = endTime || '23:00';
  }

  // Convert start and end times to Date objects for easier manipulation
  const startDate = new Date(`2023-01-01T${startTime}`);
  const endDate = new Date(`2023-01-01T${endTime}`);

  // Calculate the time interval in minutes
  const intervalInMinutes = interval * 15; // Assuming interval is in 15-minute increments

  // Iterate through the time range and generate items
  while (startDate < endDate) {
    const itemStartTime = `${startDate
      .getHours()
      .toString()
      .padStart(2, '0')}:${startDate.getMinutes().toString().padStart(2, '0')}`;

    startDate.setMinutes(startDate.getMinutes() + intervalInMinutes);

    const itemEndTime = `${startDate
      .getHours()
      .toString()
      .padStart(2, '0')}:${startDate.getMinutes().toString().padStart(2, '0')}`;

    timeRangeItems.push({
      key: `${itemStartTime}-${itemEndTime}`,
      label: `${itemStartTime} - ${itemEndTime}`,
    });
  }

  return timeRangeItems;
};

export const TimeOptions = renderListTimeOptions({});
export const TimeRangeItems = generateTimeRangeItems({});

/**
 * Get the next available delivery hours in (HH:mm) format, based on the current date and minimum delay hours
 * @example filterValidDeliveryHours(new Date(), 15) => [{ label: '06:30 - 07:00', key: '06:30-07:00' }, ...]
 */
export const filterValidDeliveryHours = ({
  startDate,
  minDelayHours = +process.env.NEXT_PUBLIC_ORDER_MINIMUM_TIME || 15,
  daySession,
}: {
  startDate: number | string | Date;
  minDelayHours?: number;
  daySession?: EDaySession;
}) => {
  const timeRangeItems = generateTimeRangeItems({ daySession });

  // Calculate the minimum allowed delivery time
  const minimumTime = new Date();
  minimumTime.setHours(minimumTime.getHours() + minDelayHours);

  // If startDate is undefined, return all time range items
  if (!startDate) {
    return timeRangeItems.map(({ label, key }) => ({ label, key }));
  }

  return timeRangeItems
    .filter((option) => {
      // Extract hour and minute from the option's start time
      const [startTime] = option.key.split('-');
      const [hours, minutes] = startTime.split(':').map(Number);
      const optionDate = new Date(startDate);
      optionDate.setHours(hours, minutes, 0, 0);

      // Only include options where the optionDate is >= minimumTime
      return optionDate >= minimumTime;
    })
    .map((option) => ({
      label: option.label,
      key: option.key,
    }));
};

export const getNextWeek = (date: Date) => {
  return DateTime.fromJSDate(date)
    .plus({ weeks: 1 })
    .startOf('week')
    .startOf('day')
    .toJSDate();
};

export const getPrevWeek = (date: Date) => {
  return DateTime.fromJSDate(date)
    .minus({ weeks: 1 })
    .startOf('week')
    .startOf('day')
    .toJSDate();
};

export const generateWeekDayList = (startDate: number, endDate: number) => {
  const weekdays = [];

  // Convert the timestamps to Luxon DateTime objects
  const startDateDT = DateTime.fromMillis(startDate).setZone(VNTimezone);
  const endDateDT = DateTime.fromMillis(endDate).setZone(VNTimezone);

  // Start at the beginning of the start date
  let currentDay = startDateDT.startOf('day');

  while (currentDay <= endDateDT) {
    // Check if the current day is a weekday (Monday: 1, Friday: 5)
    if (currentDay.weekday >= 1 && currentDay.weekday <= 5) {
      weekdays.push(currentDay.weekday);
    }

    // Move to the next day
    currentDay = currentDay.plus({ days: 1 });
  }

  return weekdays;
};

export const getYesterday = (date: Date = new Date()) => {
  return DateTime.fromJSDate(date).minus({ days: 1 }).startOf('day').toJSDate();
};

/**
 *
 * @param givenDate default is today
 * @param offset the number of days before givenDate
 * @returns the date before givenDate with offset
 */
export const getDayBeforeGivenDayWithOffset = (
  givenDate: Date = new Date(),
  offset: number = 7,
) => {
  return DateTime.fromJSDate(givenDate).minus({ days: offset }).toMillis();
};

export const getTimePeriodBetweenDates = (
  startDate: Date,
  endDate: Date,
  timePeriod: ETimeFrame,
) => {
  const start = DateTime.fromJSDate(startDate).setZone(VNTimezone);
  const end = DateTime.fromJSDate(endDate).setZone(VNTimezone);

  const timePeriods = [];

  let currentTimePeriod = start.startOf(timePeriod);

  while (currentTimePeriod <= end) {
    timePeriods.push({
      start: currentTimePeriod.toJSDate(),
      end: currentTimePeriod.endOf(timePeriod).toJSDate(),
    });
    currentTimePeriod = currentTimePeriod.plus({ [`${timePeriod}s`]: 1 });
  }

  return timePeriods;
};
