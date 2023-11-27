import type { ReactNode } from 'react';
import { useCallback } from 'react';
import type { Event } from 'react-big-calendar';
import { DateTime } from 'luxon';

import useSelectDay from '@components/CalendarDashboard/hooks/useSelectDay';
import { useViewport } from '@hooks/useViewport';
import type { TObject } from '@utils/types';

import type {
  TCalendarItemCardComponents,
  TDayColumnHeaderProps,
} from '../../helpers/types';

import DayItemContent from './DayItemContent';
import DayItemHeader from './DayItemHeader';

import css from './DayItem.module.scss';

type TWDayItemProps = {
  date: Date;
  events?: Event[];
  resources?: any;
  renderEvent?: React.FC<any>;
  components?: TCalendarItemCardComponents;
  customHeader?: (params: TDayColumnHeaderProps) => ReactNode;
  eventExtraProps?: TObject;
};

const WDayItem: React.FC<TWDayItemProps> = ({
  date,
  events = [],
  resources,
  renderEvent,
  components,
  customHeader,
  eventExtraProps,
}) => {
  const { isMobileLayout } = useViewport();
  const { onSelectDayCallBack } = resources || ({} as any);
  const { selectedDay, handleSelectDay } = useSelectDay();
  const currentDate = DateTime.fromJSDate(new Date()).startOf('day');
  const dateItem = DateTime.fromJSDate(date).startOf('day');
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

  const onClick = useCallback(() => {
    handleSelectDay?.(date);
    onSelectDayCallBack?.();
  }, [date, handleSelectDay]);

  return (
    <div
      className={css.weekDay}
      id={`dayHeader-${date.getDay()}`}
      onClick={onClick}>
      {customHeader ? (
        customHeader({
          date,
          isCurrentDay,
        })
      ) : (
        <DayItemHeader
          date={date}
          resources={resources}
          isCurrentDay={isCurrentDay}
          isSelectedDay={isSelectedDay}
        />
      )}
      {!isMobileLayout && (
        <DayItemContent
          date={date}
          events={events}
          resources={resources}
          renderEvent={renderEvent}
          eventExtraProps={eventExtraProps}
          components={components}
        />
      )}
    </div>
  );
};

export default WDayItem;
