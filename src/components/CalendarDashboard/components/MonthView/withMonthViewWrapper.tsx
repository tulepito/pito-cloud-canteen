import Skeleton from 'react-loading-skeleton';

import type { TCalendarItemCardComponents } from '@components/CalendarDashboard/helpers/types';

import MonthView from './MonthView';

import css from './MonthView.module.scss';

const createMonthViewWrapper = ({
  renderEvent,
  customComponents,
  inProgress,
  preventSelectDay,
}: {
  renderEvent: any;
  customComponents?: TCalendarItemCardComponents;
  inProgress?: boolean;
  preventSelectDay?: boolean;
}) => {
  const MonthViewWrapper = (props: any) => {
    if (inProgress) {
      return (
        <>
          <Skeleton className={css.monthViewHeaderLoading} />
          <Skeleton className={css.monthViewContentLoading} />
        </>
      );
    }

    return (
      <MonthView
        {...props}
        renderEvent={renderEvent}
        customComponents={customComponents}
        preventSelectDay={preventSelectDay}
      />
    );
  };
  MonthViewWrapper.title = MonthView.title;
  MonthViewWrapper.range = MonthView.range;
  MonthViewWrapper.navigate = MonthView.navigate;

  return MonthViewWrapper;
};

export default createMonthViewWrapper;
