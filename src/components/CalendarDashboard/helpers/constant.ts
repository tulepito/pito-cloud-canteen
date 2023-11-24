import type { TDayInWeek, TDaySession } from './types';

export const MORNING_SESSION = 'MORNING_SESSION';
export const AFTERNOON_SESSION = 'AFTERNOON_SESSION';
export const EVENING_SESSION = 'EVENING_SESSION';
export const DINNER_SESSION = 'DINNER_SESSION';
export const DAY_SESSIONS: TDaySession[] = [
  MORNING_SESSION,
  AFTERNOON_SESSION,
  EVENING_SESSION,
  DINNER_SESSION,
];

export const EMPTY_STATUS = 'empty';
export const JOINED_STATUS = 'joined';
export const NOT_JOINED_STATUS = 'notJoined';
export const EXPIRED_STATUS = 'expired';
export const CANCELED_STATUS = 'canceled';

export const EVENT_STATUS = {
  EMPTY_STATUS,
  JOINED_STATUS,
  NOT_JOINED_STATUS,
  EXPIRED_STATUS,
  CANCELED_STATUS,
};

export const DAY_IN_WEEK: TDayInWeek[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

export enum ENavigate {
  PREVIOUS = 'PREV',
  NEXT = 'NEXT',
  TODAY = 'TODAY',
  DATE = 'DATE',
}

export enum EViewMode {
  MONTH = 'month',
  WEEK = 'week',
}
