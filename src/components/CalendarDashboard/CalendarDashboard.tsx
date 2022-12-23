import 'react-big-calendar/lib/css/react-big-calendar.css';

import { DateTime } from 'luxon';
import { useMemo } from 'react';
import type { Event, ViewsProps } from 'react-big-calendar';
import { Calendar, luxonLocalizer, Views } from 'react-big-calendar';

import css from './CalendarDashboard.module.scss';
import WeekView from './components/WeekView/WeekView';

type TCalendarDashboard = {
  defaultDate?: Date;
  events?: Event[] | undefined;
};

const CalendarDashboard: React.FC<TCalendarDashboard> = ({
  defaultDate: propsDefaultDate,
  events = [],
}) => {
  const localizer = luxonLocalizer(DateTime);

  const { defaultDate, views } = useMemo(
    () => ({
      defaultDate:
        propsDefaultDate || DateTime.now().startOf('week').toJSDate(),
      views: {
        month: true,
        week: WeekView as any,
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
