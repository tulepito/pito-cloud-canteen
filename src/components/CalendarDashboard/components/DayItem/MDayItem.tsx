import { useCallback } from 'react';
import type { Event } from 'react-big-calendar';
import { DateTime } from 'luxon';

import useSelectDay from '@components/CalendarDashboard/hooks/useSelectDay';

import type { TCalendarItemCardComponents } from '../../helpers/types';

import DayItemContent from './DayItemContent';
import DayItemFooter from './DayItemFooter';

import css from './DayItem.module.scss';

type TMDayItemProps = {
  date: Date;
  events?: Event[];
  renderEvent?: React.FC<any>;
  components?: TCalendarItemCardComponents;
  resources?: any;
  selectedDay?: Date;
  onSelectDay?: (date: Date) => void;
  preventSelectDay?: boolean;
};

const MDayItem: React.FC<TMDayItemProps> = ({
  date,
  events = [],
  renderEvent,
  components,
  resources,
  preventSelectDay,
}) => {
  const currentDate = DateTime.fromJSDate(new Date()).startOf('day');
  const dateItem = DateTime.fromJSDate(date).startOf('day');
  const { selectedDay, handleSelectDay } = useSelectDay();
  const isSelectedDay =
    DateTime.fromJSDate(selectedDay!)
      .startOf('day')
      .diff(dateItem, ['day', 'hour'])
      .get('day') === 0;
  const isCurrentDay =
    DateTime.fromJSDate(date)
      .startOf('day')
      .diff(currentDate, ['day', 'hour'])
      .get('day') === 0;

  const onDayClick = useCallback(() => {
    if (preventSelectDay) return;

    handleSelectDay?.(date);
  }, [date, handleSelectDay, preventSelectDay]);

  return (
    <div className={css.monthDay} onClick={onDayClick}>
      <DayItemContent
        date={date}
        events={events}
        resources={resources}
        renderEvent={renderEvent}
        components={components}
      />
      <DayItemFooter
        resources={resources}
        date={date}
        isCurrentDay={isCurrentDay}
        isSelectedDay={isSelectedDay}
      />
    </div>
  );
};

export default MDayItem;
