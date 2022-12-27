import 'react-big-calendar/lib/css/react-big-calendar.css';

import { getEventsInDate } from '@components/CalendarDashboard/helpers/date';
import { useViewport } from '@hooks/useViewport';
import { DateTime } from 'luxon';
import { useEffect, useMemo } from 'react';
import type { NavigateAction, TimeGridProps } from 'react-big-calendar';
import { Navigate } from 'react-big-calendar';
import { FormattedMessage } from 'react-intl';

import DayColumn from '../DayColumn/DayColumn';
import css from './WeekView.module.scss';

const WEEK_DAYS_NUMBER = 7;

type TWeekViewProps = {
  date: Date;
  localizer: any;
  range: any;
  accessors: any;
} & TimeGridProps;

type TWeekViewObject = {
  range: any;
  navigate: any;
  title: any;
  dayInWeek: number;
};

function WeekView({
  date,
  localizer,
  events = [],
}: TWeekViewProps & TWeekViewObject) {
  const {
    viewport: { width },
  } = useViewport();
  const currRange = useMemo(
    () => WeekView.range(date, { localizer }),
    [date, localizer],
  );

  useEffect(() => {
    if (width < 768) {
      document
        .querySelector(`#weekView`)
        ?.scrollTo({ left: date.getDay() * (width - 66) });
    } else if (width >= 768 && width < 1128) {
      document
        .querySelector(`#weekView`)
        ?.scrollTo({ left: date.getDay() * (1440 / 7) });
    }
  }, [date, width]);

  return (
    <div className={css.root} id={`weekView`}>
      <div className={css.scrollContainer}>
        {currRange.map((item) => (
          <DayColumn
            date={item}
            key={item.getTime()}
            events={getEventsInDate(item, events)}
          />
        ))}
      </div>
    </div>
  );
}

WeekView.range = (date: Date, { localizer }: { localizer: any }) => {
  const start = DateTime.fromJSDate(date).startOf('week').toJSDate();
  const end = localizer.add(start, WEEK_DAYS_NUMBER - 1, 'day');

  let current = start;
  const range = [];

  while (localizer.lte(current, end, 'day')) {
    range.push(current);
    current = localizer.add(current, 1, 'day');
  }

  return range;
};

WeekView.navigate = (
  date: Date,
  action: NavigateAction,
  { localizer }: { localizer: any },
) => {
  switch (action) {
    case Navigate.PREVIOUS:
      return localizer.add(date, -WEEK_DAYS_NUMBER, 'day');

    case Navigate.NEXT:
      return localizer.add(date, WEEK_DAYS_NUMBER, 'day');

    default:
      return date;
  }
};

WeekView.title = (date: Date, { localizer }: { localizer: any }) => {
  const [start, end] = WeekView.range(date, {
    localizer,
  });
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

export default WeekView;
