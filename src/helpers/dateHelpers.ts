import { DateTime } from 'luxon';

import { VNTimezone } from '@src/utils/dates';

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

export const convertDateToVNTimezone = (
  date: Date,
  options?: {
    format?: string;
  },
) => {
  const dateInVNTimezone = DateTime.fromJSDate(date, {
    zone: VNTimezone,
  });

  if (options?.format) {
    return dateInVNTimezone.toFormat(options.format);
  }

  return dateInVNTimezone.toISO().split('.')[0];
};

/**
 * Format time ago
 * @param timestamp - The timestamp to format
 * @param locale - The locale to format the time ago
 * @returns
 */
export const formatTimeAgo = (timestamp: number, locale: string = 'vi') => {
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diffMs = Math.max(0, now - then);

  const minuteMs = 60 * 1000;
  const hourMs = 60 * minuteMs;
  const dayMs = 24 * hourMs;
  const monthMs = 30 * dayMs;

  const normalized = (locale || 'vi').toLowerCase();
  const isVi = normalized.startsWith('vi');

  if (diffMs < minuteMs) {
    return isVi ? 'Vừa xong' : 'Just now';
  }

  if (diffMs < hourMs) {
    const minutes = Math.floor(diffMs / minuteMs);
    if (isVi) {
      return `${minutes} phút trước`;
    }

    return `${minutes} minutes ago`;
  }

  if (diffMs < dayMs) {
    const hours = Math.floor(diffMs / hourMs);
    if (isVi) {
      return `${hours} giờ trước`;
    }

    return `${hours} hours ago`;
  }

  if (diffMs < monthMs) {
    const days = Math.floor(diffMs / dayMs);
    if (isVi) {
      return `${days} ngày trước`;
    }

    return `${days} days ago`;
  }

  const months = Math.floor(diffMs / monthMs);
  if (isVi) {
    return `${months} tháng trước`;
  }

  return `${months} months ago`;
};
