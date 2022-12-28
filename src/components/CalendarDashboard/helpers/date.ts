import { DateTime } from 'luxon';
import type { Event } from 'react-big-calendar';

import {
  AFTERNOON_SESSION,
  EVENING_SESSION,
  MORNING_SESSION,
} from './constant';

const getStartOfDate = (date: Date) =>
  DateTime.fromJSDate(date).startOf('day').toJSDate();

const getEndOfDate = (date: Date) =>
  DateTime.fromJSDate(date).endOf('day').toJSDate();

export const getEventsInDate = (date: Date, events: Event[]) => {
  const startOfDate = getStartOfDate(date);
  const endOfDate = getEndOfDate(date);
  return events.filter((event: Event) => {
    if (event.start && event.end) {
      return (
        DateTime.fromJSDate(startOfDate)
          .diff(DateTime.fromJSDate(event.start), 'day')
          .get('day') <= 0 &&
        DateTime.fromJSDate(endOfDate)
          .diff(DateTime.fromJSDate(event.end), 'day')
          .get('day') >= 0
      );
    }

    return false;
  });
};

// Day section: ''
// In file ./constant.ts
export const getEventsInPeriod = ({ events }: { events: Event[] }) => {
  const groupedEvents = events.reduce(
    (groupData: any, event: Event) => {
      groupData[event.resource?.daySession].push(event);
      return groupData;
    },
    {
      [MORNING_SESSION]: [],
      [AFTERNOON_SESSION]: [],
      [EVENING_SESSION]: [],
    },
  );
  return groupedEvents;
};
