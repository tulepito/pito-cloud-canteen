import 'react-big-calendar/lib/css/react-big-calendar.css';

import { DAY_IN_WEEK } from '@components/CalendarDashboard/helpers/constant';
import { getEventsInDate } from '@components/CalendarDashboard/helpers/date';
import { DateTime } from 'luxon';
import { useMemo } from 'react';
import type { NavigateAction, TimeGridProps } from 'react-big-calendar';
import { Navigate } from 'react-big-calendar';
import { FormattedMessage } from 'react-intl';

import type { TCalendarItemCardComponents } from '../../helpers/types';
import MDayItem from '../DayItem/MDayItem';
import IconCalendarToolbar from '../Icons/IconCalendar';
import css from './MonthView.module.scss';

const MONTH_DAY_NUMBER = 31;

type TMonthViewProps = {
  date: Date;
  localizer: any;
  range: any;
  accessors: any;
  renderEvent?: React.FC<any>;
  customComponents?: TCalendarItemCardComponents;
} & TimeGridProps;

type TMonthViewObject = {
  range: any;
  navigate: any;
  title: any;
};

function MonthView({
  date,
  localizer,
  events = [],
  renderEvent,
  customComponents,
}: TMonthViewProps & TMonthViewObject) {
  const currRange = useMemo(
    () => MonthView.range(date, { localizer }),
    [date, localizer],
  );
  const firstDay = currRange[0];
  const totalEmptyDays = (firstDay.getDay() || 7) - 1;
  const emptyDayEls = Array.from(Array(totalEmptyDays).keys());
  return (
    <div className={css.root}>
      <div className={css.scrollContainer}>
        {DAY_IN_WEEK.map((item) => (
          <div key={item} className={css.dayInWeekHeader}>
            <FormattedMessage id={`MonthView.dayInWeekHeader.${item}`} />
          </div>
        ))}
        {emptyDayEls.map((item) => (
          <div key={item} className={css.emptyDay}></div>
        ))}
        {currRange.map((item) => (
          <MDayItem
            date={item}
            key={item.getTime()}
            events={getEventsInDate(item, events)}
            renderEvent={renderEvent}
            components={customComponents}
          />
        ))}
      </div>
    </div>
  );
}

MonthView.range = (date: Date, { localizer }: { localizer: any }) => {
  const start = DateTime.fromJSDate(date).startOf('month').toJSDate();
  const { daysInMonth } = DateTime.fromJSDate(date);
  const end = localizer.add(start, daysInMonth - 1, 'day');

  let current = start;
  const range = [];

  while (localizer.lte(current, end, 'day')) {
    range.push(current);
    current = localizer.add(current, 1, 'day');
  }

  return range;
};

MonthView.navigate = (
  date: Date,
  action: NavigateAction,
  { localizer }: { localizer: any },
) => {
  switch (action) {
    case Navigate.PREVIOUS:
      return localizer.add(date, -MONTH_DAY_NUMBER, 'day');

    case Navigate.NEXT:
      return localizer.add(date, MONTH_DAY_NUMBER, 'day');

    default:
      return date;
  }
};

MonthView.title = (date: Date, { localizer }: { localizer: any }) => {
  const [start] = MonthView.range(date, { localizer });

  return (
    <div className={css.calendarTitleWrapper}>
      <IconCalendarToolbar />
      <span className={css.calendarTitle}>
        <FormattedMessage
          id="MonthView.monthName"
          values={{
            month: start.getMonth() + 1,
          }}
        />
      </span>
    </div>
  );
};

export default MonthView;
