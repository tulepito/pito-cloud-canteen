import { DateTime } from 'luxon';

export const parseDateFromTimestampAndHourString = (
  timestamp: number,
  hourStr: string,
  formatStr?: string,
) => {
  const parsedDate = DateTime.fromMillis(timestamp).toFormat('yyyy-MM-dd');
  return DateTime.fromISO(`${parsedDate}T${hourStr}:00`).toFormat(
    formatStr || 'yyyy-MM-dd',
  );
};
