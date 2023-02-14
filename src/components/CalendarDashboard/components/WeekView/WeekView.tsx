import 'react-big-calendar/lib/css/react-big-calendar.css';

import { getEventsInDate } from '@components/CalendarDashboard/helpers/date';
import { useViewport } from '@hooks/useViewport';
import { DateTime } from 'luxon';
import { useEffect, useMemo } from 'react';
import type { NavigateAction, TimeGridProps } from 'react-big-calendar';
import { Navigate } from 'react-big-calendar';

import type { TCalendarItemCardComponents } from '../../helpers/types';
import WDayItem from '../DayItem/WDayItem';
import IconCalendarToolbar from '../Icons/IconCalendar';
import css from './WeekView.module.scss';

const WEEK_DAYS_NUMBER = 7;

type TWeekViewProps = {
  date: Date;
  localizer: any;
  range: any;
  accessors: any;
  renderEvent?: React.FC<any>;
  customComponents?: TCalendarItemCardComponents;
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
  renderEvent,
  customComponents,
  resources,
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
          <WDayItem
            date={item}
            key={item.getTime()}
            events={getEventsInDate(item, events)}
            resources={resources}
            renderEvent={renderEvent}
            components={customComponents}
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
  const [start, ...rest] = WeekView.range(date, {
    localizer,
  });
  const end = rest[rest.length - 1];

  return (
    <div className={css.calendarTitleWrapper}>
      <IconCalendarToolbar />
      <span className={css.calendarTitle}>
        {start.getDate()}/{start.getMonth() + 1} - {end.getDate()}/
        {end.getMonth() + 1}
      </span>
    </div>
  );
};

export default WeekView;
