import Skeleton from 'react-loading-skeleton';

import type { TCalendarItemCardComponents } from '../../helpers/types';
import WeekView from './WeekView';
import css from './WeekView.module.scss';

const withWeekViewWrapper = ({
  renderEvent,
  customComponents,
  inProgress,
}: {
  renderEvent: any;
  customComponents?: TCalendarItemCardComponents;
  inProgress?: boolean;
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
      />
    );
  };
  WeekViewWrapper.title = WeekView.title;
  WeekViewWrapper.range = WeekView.range;
  WeekViewWrapper.navigate = WeekView.navigate;

  return WeekViewWrapper;
};

export default withWeekViewWrapper;
