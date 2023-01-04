import 'react-big-calendar/lib/css/react-big-calendar.css';

import { DateTime } from 'luxon';
import type { ReactNode } from 'react';
import { useMemo } from 'react';
import type { Event, ViewsProps } from 'react-big-calendar';
import { Calendar, luxonLocalizer, Views } from 'react-big-calendar';

import css from './CalendarDashboard.module.scss';
import createMonthViewWrapper from './components/MonthView/withMonthViewWrapper';
import OrderEventCard from './components/OrderEventCard/OrderEventCard';
import Toolbar from './components/Toolbar/Toolbar';
import withWeekViewWrapper from './components/WeekView/withWeekViewWrapper';
import type { TCalendarItemCardComponents } from './helpers/types';

type TCalendarDashboard = {
  defaultDate?: Date;
  events?: Event[] | undefined;
  renderEvent?: React.FC<any>;
  companyLogo?: ReactNode;
  components?: TCalendarItemCardComponents;
};

const CalendarDashboard: React.FC<TCalendarDashboard> = ({
  defaultDate: propsDefaultDate,
  events = [],
  renderEvent = OrderEventCard,
  companyLogo,
  components,
}) => {
  const localizer = luxonLocalizer(DateTime);

  const MonthViewWrapper = createMonthViewWrapper({
    renderEvent,
    customComponents: components,
  });
  const WeekViewWrapper = withWeekViewWrapper({
    renderEvent,
    customComponents: components,
  });

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
        components={{
          toolbar: (props: any) => (
            <Toolbar {...props} companyLogo={companyLogo} />
          ),
        }}
      />
    </div>
  );
};

export default CalendarDashboard;
