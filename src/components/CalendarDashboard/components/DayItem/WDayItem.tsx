import useBoolean from '@hooks/useBoolean';
import type { TObject } from '@utils/types';
import { DateTime } from 'luxon';
import type { ReactNode } from 'react';
import type { Event } from 'react-big-calendar';

import type {
  TCalendarItemCardComponents,
  TDayColumnHeaderProps,
} from '../../helpers/types';
import css from './DayItem.module.scss';
import DayItemContent from './DayItemContent';
import DayItemHeader from './DayItemHeader';

type TWDayItemProps = {
  date: Date;
  events?: Event[];
  renderEvent?: React.FC<any>;
  components?: TCalendarItemCardComponents;
  customHeader?: (params: TDayColumnHeaderProps) => ReactNode;
  eventExtraProps?: TObject;
};

const WDayItem: React.FC<TWDayItemProps> = ({
  date,
  events = [],
  renderEvent,
  components,
  customHeader,
  eventExtraProps,
}) => {
  const {
    value: isMouseOnDay,
    setTrue: setMouseOnDay,
    setFalse: setMouseLeaveDay,
  } = useBoolean();
  const currentDate = DateTime.fromJSDate(new Date()).startOf('day');
  const isCurrentDay =
    DateTime.fromJSDate(date)
      .startOf('day')
      .diff(currentDate, ['day', 'hour'])
      .get('day') === 0;

  return (
    <div
      onMouseEnter={setMouseOnDay}
      onMouseLeave={setMouseLeaveDay}
      className={css.weekDay}
      id={`dayHeader-${date.getDay()}`}>
      {customHeader ? (
        customHeader({
          date,
          isCurrentDay,
          isMouseOnDay,
        })
      ) : (
        <DayItemHeader
          date={date}
          isCurrentDay={isCurrentDay}
          isMouseOnDay={isMouseOnDay}
        />
      )}
      <DayItemContent
        date={date}
        events={events}
        renderEvent={renderEvent}
        eventExtraProps={eventExtraProps}
        components={components}
      />
    </div>
  );
};

export default WDayItem;
