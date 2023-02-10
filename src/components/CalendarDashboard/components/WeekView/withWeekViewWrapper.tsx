import type { ReactNode } from 'react';
import Skeleton from 'react-loading-skeleton';

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
}: {
  renderEvent: any;
  customComponents?: TCalendarItemCardComponents;
  inProgress?: boolean;
  customHeader?: (params: TDayColumnHeaderProps) => ReactNode;
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
        customComponents={customComponents}
        customHeader={customHeader}
      />
    );
  };
  WeekViewWrapper.title = WeekView.title;
  WeekViewWrapper.range = WeekView.range;
  WeekViewWrapper.navigate = WeekView.navigate;

  return WeekViewWrapper;
};

export default withWeekViewWrapper;
