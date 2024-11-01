/* eslint-disable react-hooks/exhaustive-deps */
import type { ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Event, ViewsProps } from 'react-big-calendar';
import { Calendar, luxonLocalizer, Views } from 'react-big-calendar';
import classNames from 'classnames';
import { DateTime } from 'luxon';

import type { TDefaultProps, TObject } from '@utils/types';

import createMonthViewWrapper from './components/MonthView/withMonthViewWrapper';
import OrderEventCard from './components/OrderEventCard/OrderEventCard';
import Toolbar from './components/Toolbar/Toolbar';
import withWeekViewWrapper from './components/WeekView/withWeekViewWrapper';
import type {
  TCalendarItemCardComponents,
  TDayColumnHeaderProps,
} from './helpers/types';

import 'react-big-calendar/lib/css/react-big-calendar.css';
import css from './CalendarDashboard.module.scss';

type TCalendarDashboardProps = TDefaultProps & {
  anchorDate?: Date;
  defaultDate?: Date;
  startDate?: Date;
  endDate?: Date;
  events?: Event[] | undefined;
  renderEvent?: React.FC<any>;
  companyLogo?: ReactNode;
  components?: TCalendarItemCardComponents;
  inProgress?: boolean;
  recommendButton?: ReactNode;
  hideMonthView?: boolean;
  hideWeekView?: boolean;
  headerComponent?: (params: TDayColumnHeaderProps) => ReactNode;
  eventExtraProps?: TObject;
  resources?: any;
  exposeAnchorDate?: (date?: Date) => void;
  defaultView?: 'month' | 'week' | 'work_week' | 'day' | 'agenda';
  toolbarLabel?: ReactNode;
  hidePrevToolbarNavButton?: boolean;
  hideNextToolbarNavButton?: boolean;
};

const CalendarDashboard: React.FC<TCalendarDashboardProps> = ({
  rootClassName,
  className,
  anchorDate,
  defaultDate: propsDefaultDate,
  events = [],
  renderEvent = OrderEventCard,
  companyLogo,
  components,
  inProgress,
  recommendButton,
  startDate,
  endDate,
  hideMonthView,
  hideWeekView,
  headerComponent,
  eventExtraProps,
  resources,
  exposeAnchorDate,
  toolbarLabel,
  defaultView = Views.WEEK,
  hidePrevToolbarNavButton = false,
  hideNextToolbarNavButton = false,
}) => {
  const [calDate, setCalDate] = useState<Date | undefined>(anchorDate);

  const localizer = luxonLocalizer(DateTime) as any;

  const classes = classNames(rootClassName || css.root, className);

  const MonthViewWrapper = !hideMonthView
    ? createMonthViewWrapper({
        renderEvent,
        customComponents: components,
        inProgress,
      })
    : false;
  const WeekViewWrapper = !hideWeekView
    ? withWeekViewWrapper({
        inProgress,
        renderEvent,
        customComponents: components,
        customHeader: headerComponent,
        eventExtraProps,
      })
    : false;

  const { defaultDate, views } = useMemo(
    () => ({
      defaultDate:
        propsDefaultDate || DateTime.now().startOf('week').toJSDate(),
      views: {
        ...(hideWeekView ? {} : { week: WeekViewWrapper as any }),
        ...(hideMonthView ? {} : { month: MonthViewWrapper as any }),
      } as ViewsProps,
    }),
    // If you guys want to update defaultDate for calendar when props.propsDefaultDate
    // changes, please add "propsDefaultDate" to deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [inProgress, propsDefaultDate],
  );
  const anchorDateProps = useMemo(() => {
    return anchorDate
      ? {
          date: calDate,
          onNavigate: (newDate: Date) => {
            setCalDate(newDate);
          },
        }
      : { defaultDate };
  }, [anchorDate, calDate, defaultDate]);

  const toolbarExtraProps = useMemo(() => {
    return {
      companyLogo,
      recommendButton,
      startDate,
      endDate,
      anchorDate: calDate,
      label: toolbarLabel,
      hidePrevNavButton: hidePrevToolbarNavButton,
      hideNextNavButton: hideNextToolbarNavButton,
    };
  }, [
    companyLogo,
    recommendButton,
    startDate,
    endDate,
    calDate,
    toolbarLabel,
    hidePrevToolbarNavButton,
    hideNextToolbarNavButton,
  ]);

  useEffect(() => {
    setCalDate(anchorDate);
  }, [anchorDate]);

  useEffect(() => {
    if (typeof exposeAnchorDate === 'function') {
      exposeAnchorDate(calDate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calDate]);

  const defaultToolbar = useCallback(
    (props: any) => {
      return (
        <Toolbar
          {...props}
          {...toolbarExtraProps}
          label={toolbarExtraProps.label || props.label}
        />
      );
    },
    [toolbarExtraProps],
  );

  const componentsProps = useMemo(() => {
    return {
      toolbar: components?.toolbar || defaultToolbar,
    };
  }, [components?.toolbar, defaultToolbar]);

  return (
    <div className={classes}>
      <Calendar
        {...anchorDateProps}
        defaultView={defaultView}
        localizer={localizer}
        events={events}
        views={views}
        resources={resources}
        components={componentsProps}
      />
    </div>
  );
};

export default CalendarDashboard;
