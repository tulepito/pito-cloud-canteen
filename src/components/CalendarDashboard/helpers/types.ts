import type React from 'react';

export type TDaySession =
  | 'MORNING_SESSION'
  | 'AFTERNOON_SESSION'
  | 'EVENING_SESSION'
  | 'DINNER_SESSION';

export enum EDaySession {
  MORNING_SESSION = 'MORNING_SESSION',
  AFTERNOON_SESSION = 'AFTERNOON_SESSION',
  EVENING_SESSION = 'EVENING_SESSION',
  DINNER_SESSION = 'DINNER_SESSION',
}

export type TEventStatus = 'empty' | 'joined' | 'expired' | 'notJoined';

export type TDayInWeek =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export type TCalendarItemCardComponents = {
  contentEnd?: React.FC<any>;
  contentStart?: React.FC<any>;
  toolbar?: React.FC<any>;
};

export type TDayColumnHeaderProps = {
  isCurrentDay: boolean;
  isSelectedDay?: boolean;
  date: Date;
  resources?: any;
  className?: string;
  shouldHideDate?: boolean;
  shouldHideDateText?: boolean;
  indicator?: boolean;
  isDisabled?: boolean;
};
