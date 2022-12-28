import 'react-big-calendar/lib/css/react-big-calendar.css';

import { DateTime } from 'luxon';
import { useMemo } from 'react';
import type { Event, ViewsProps } from 'react-big-calendar';
import { Calendar, luxonLocalizer, Views } from 'react-big-calendar';

import css from './CalendarDashboard.module.scss';
import EventTile from './components/EventTile/EventTile';
import createMonthViewWrapper from './components/MonthView/withMonthViewWrapper';
import withWeekViewWrapper from './components/WeekView/withWeekViewWrapper';

type TCalendarDashboard = {
  defaultDate?: Date;
  events?: Event[] | undefined;
  renderEvent?: React.FC<any>;
};

const CalendarDashboard: React.FC<TCalendarDashboard> = ({
  defaultDate: propsDefaultDate,
  events = [],
  renderEvent = EventTile,
}) => {
  const localizer = luxonLocalizer(DateTime);

  const MonthViewWrapper = createMonthViewWrapper(renderEvent);
  const WeekViewWrapper = withWeekViewWrapper(renderEvent);

  const { defaultDate, views } = useMemo(
    () => ({
      defaultDate:
        propsDefaultDate || DateTime.now().startOf('week').toJSDate(),
      views: {
        month: MonthViewWrapper as any,
        week: WeekViewWrapper as any,
      } as ViewsProps,
    }),
    // If you guys want to update defaultDate for calendar when props.propsDefaultDate
    // changes, please add "propsDefaultDate" to deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <div className={css.root}>
      <Calendar
        defaultDate={defaultDate}
        defaultView={Views.WEEK}
        localizer={localizer}
        events={events}
        views={views}
      />
    </div>
  );
};

export default CalendarDashboard;
