import 'react-big-calendar/lib/css/react-big-calendar.css';

import classNames from 'classnames';
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

type TCalendarDashboardProps = {
  rootClassName?: string;
  className?: string;
  defaultDate?: Date;
  startDate?: Date;
  endDate?: Date;
  events?: Event[] | undefined;
  renderEvent?: React.FC<any>;
  companyLogo?: ReactNode;
  components?: TCalendarItemCardComponents;
  inProgress?: boolean;
};

const CalendarDashboard: React.FC<TCalendarDashboardProps> = ({
  rootClassName,
  className,
  startDate,
  endDate,
  defaultDate: propsDefaultDate,
  events = [],
  renderEvent = OrderEventCard,
  companyLogo,
  components,
  inProgress,
}) => {
  const localizer = luxonLocalizer(DateTime);
  const classes = classNames(rootClassName || css.root, className);

  const MonthViewWrapper = createMonthViewWrapper({
    renderEvent,
    customComponents: components,
  });
  const WeekViewWrapper = withWeekViewWrapper({
    inProgress,
    renderEvent,
    customComponents: components,
  });

  const { defaultDate, views } = useMemo(
    () => ({
      defaultDate:
        startDate ||
        propsDefaultDate ||
        DateTime.now().startOf('week').toJSDate(),
      views: {
        week: WeekViewWrapper as any,
        month: MonthViewWrapper as any,
      } as ViewsProps,
    }),
    // If you guys want to update defaultDate for calendar when props.propsDefaultDate
    // changes, please add "propsDefaultDate" to deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [inProgress],
  );

  const toolbarExtraProps = {
    companyLogo,
    startDate,
    endDate,
  };

  return (
    <div className={classes}>
      <Calendar
        defaultDate={defaultDate}
        defaultView={Views.WEEK}
        localizer={localizer}
        events={events}
        views={views}
        components={{
          toolbar: (props: any) => (
            <Toolbar {...props} {...toolbarExtraProps} />
          ),
        }}
      />
    </div>
  );
};

export default CalendarDashboard;
