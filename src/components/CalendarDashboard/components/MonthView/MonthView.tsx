import 'react-big-calendar/lib/css/react-big-calendar.css';

import { DAY_IN_WEEK } from '@components/CalendarDashboard/helpers/constant';
import { getEventsInDate } from '@components/CalendarDashboard/helpers/date';
import classNames from 'classnames';
import { DateTime } from 'luxon';
import { useMemo } from 'react';
import type { NavigateAction, TimeGridProps } from 'react-big-calendar';
import { Navigate } from 'react-big-calendar';
import { FormattedMessage } from 'react-intl';

import MDayItem from '../DayItem/MDayItem';
import css from './MonthView.module.scss';

const MONTH_DAY_NUMBER = 30;

type TMonthViewProps = {
  date: Date;
  localizer: any;
  range: any;
  accessors: any;
  renderEvent?: React.FC<any>;
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
}: TMonthViewProps & TMonthViewObject) {
  const currRange = useMemo(
    () => MonthView.range(date, { localizer }),
    [date, localizer],
  );

  const currentDay = new Date().getDay();

  return (
    <div className={css.root}>
      <div className={css.scrollContainer}>
        {DAY_IN_WEEK.map((item, index) => (
          <div
            key={item}
            className={classNames(css.dayInWeekHeader, {
              [css.activeDayHeader]: currentDay === index + 1,
            })}>
            <FormattedMessage id={`MonthView.dayInWeekHeader.${item}`} />
          </div>
        ))}
        {currRange.map((item) => (
          <MDayItem
            date={item}
            key={item.getTime()}
            events={getEventsInDate(item, events)}
            renderEvent={renderEvent}
          />
        ))}
      </div>
    </div>
  );
}

MonthView.range = (date: Date, { localizer }: { localizer: any }) => {
  const start = DateTime.fromJSDate(date).startOf('week').toJSDate();
  const end = localizer.add(start, MONTH_DAY_NUMBER - 1, 'day');

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
  const [start, end] = MonthView.range(date, { localizer });
  const isSameMonth = start.getMonth() === end.getMonth();
  const isSameYear = start.getFullYear() === end.getFullYear();
  if (isSameMonth) {
    return (
      <span className={css.calendarTitle}>
        <FormattedMessage
          id="Calendar.Week.title"
          values={{
            start: start.getDate(),
            end: end.getDate(),
            month: start.getMonth() + 1,
            year: start.getFullYear(),
          }}
        />
      </span>
    );
  }
  if (isSameYear) {
    return (
      <span className={css.calendarTitle}>
        <FormattedMessage
          id="Calendar.Week.title.diffMonth"
          values={{
            start: `${start.getDate()} Tháng ${start.getMonth() + 1}`,
            end: `${end.getDate()} Tháng ${start.getMonth() + 1}`,
            year: start.getFullYear(),
          }}
        />
      </span>
    );
  }
  return (
    <span className={css.calendarTitle}>
      <FormattedMessage
        id="Calendar.Week.title.diffYear"
        values={{
          start: `${start.getDate()} Tháng ${
            start.getMonth() + 1
          }, ${start.getFullYear()}`,
          end: `${end.getDate()} Tháng ${
            start.getMonth() + 1
          }, ${start.getFullYear()}`,
        }}
      />
    </span>
  );
};

export default MonthView;
