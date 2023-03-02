import { DateTime } from 'luxon';

export const parseDateFromTimestampAndHourString = (
  timestamp: number,
  hourStr: string,
  formatStr: string = 'yyyy-MM-dd',
) => {
  const parsedDate = DateTime.fromMillis(Number(timestamp)).toFormat(
    'yyyy-MM-dd',
  );
  return DateTime.fromISO(`${parsedDate}T${hourStr}:00`).toFormat(formatStr);
};

/**
 *
 * @param timeStr `HH:mm`
 */
export const convertHHmmStringToTimeParts = (timeStr = '6:30') => {
  const [hours, minutes] = timeStr.split(':') || ['6', '30'];

  return { hours: parseInt(hours, 10), minutes: parseInt(minutes, 10) };
};
