import jstz from 'jstimezonedetect';
import { DateTime } from 'luxon';

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

export const parseTimestampToFormat = (date: number) => {
  return DateTime.fromMillis(date).toFormat('dd/MM/yyyy');
};
