import type { ReactNode } from 'react';
import Skeleton from 'react-loading-skeleton';

import type { TObject } from '@utils/types';

import type {
  TCalendarItemCardComponents,
  TDayColumnHeaderProps,
} from '../../helpers/types';

import WeekView from './WeekView';

import css from './WeekView.module.scss';

const withWeekViewWrapper = ({
  renderEvent,
  customComponents,
  inProgress,
  customHeader,
  eventExtraProps,
  preventSelectDay,
}: {
  renderEvent: any;
  customComponents?: TCalendarItemCardComponents;
  inProgress?: boolean;
  customHeader?: (params: TDayColumnHeaderProps) => ReactNode;
  eventExtraProps?: TObject;
  preventSelectDay?: boolean;
}) => {
  const WeekViewWrapper = (props: any) => {
    if (inProgress) {
      return (
        <>
          <Skeleton className={css.weekViewHeaderLoading} />
          <Skeleton className={css.weekViewContentLoading} />
        </>
      );
    }

    return (
      <WeekView
        {...props}
        renderEvent={renderEvent}
        eventExtraProps={eventExtraProps}
        customComponents={customComponents}
        customHeader={customHeader}
        preventSelectDay={preventSelectDay}
      />
    );
  };
  WeekViewWrapper.title = WeekView.title;
  WeekViewWrapper.range = WeekView.range;
  WeekViewWrapper.navigate = WeekView.navigate;

  return WeekViewWrapper;
};

export default withWeekViewWrapper;
