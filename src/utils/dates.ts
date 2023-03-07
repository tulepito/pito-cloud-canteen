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

import { getUniqueString } from './data';
import { EDayOfWeek } from './enums';

const DAY_IN_WEEK = [
  { key: 'mon', label: 'DayInWeekField.mon' },
  { key: 'tue', label: 'DayInWeekField.tue' },
  { key: 'wed', label: 'DayInWeekField.wed' },
  { key: 'thu', label: 'DayInWeekField.thu' },
  { key: 'fri', label: 'DayInWeekField.fri' },
  { key: 'sat', label: 'DayInWeekField.sat' },
  { key: 'sun', label: 'DayInWeekField.sun' },
];

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

export const formatTimestamp = (
  date = new Date().getTime(),
  format?: string,
  locale: LocaleOptions['locale'] = 'vi',
) => {
  return DateTime.fromMillis(Number(date)).toFormat(format || 'dd/MM/yyyy', {
    locale,
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

export const TimeOptions = generateTimeOptions();

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

export const getStartOfWeek = (anchorDate: number) => {
  return DateTime.fromMillis(anchorDate).startOf('week').toJSDate();
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
  return DateTime.fromMillis(date1).diff(DateTime.fromMillis(date2), units)
    .days;
};

export const printHoursToString = (hours: number, minutes: number) => {
  const minutesToRender = minutes < 10 ? `0${minutes}` : minutes;
  const hoursToRender = hours < 10 ? `0${hours}` : hours;
  const hoursAndMinutes = `${hoursToRender}:${minutesToRender}`;
  return hoursAndMinutes;
};

const DAYS = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

const addDays = (d: Date, days: number) => {
  const date = new Date(d);
  date.setDate(date.getDate() + days);
  return date;
};

const getDates = (startDate: Date, stopDate: Date) => {
  const dateArray = [];
  let currentDate = new Date(startDate);
  while (currentDate <= stopDate) {
    dateArray.push(new Date(currentDate));
    currentDate = addDays(currentDate, 1);
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

  classDays = rangeDates.filter((f) =>
    daysOfWeekUpperCase.some(
      (d) => DAYS[d as keyof typeof DAYS] === f.getDay(),
    ),
  );
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
  console.log({ startDate, endDate });
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
