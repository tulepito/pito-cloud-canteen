import type { ReactNode } from 'react';
import type { Event } from 'react-big-calendar';
import { DateTime } from 'luxon';

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
  const currentDate = DateTime.fromJSDate(new Date()).startOf('day');
  const isCurrentDay =
    DateTime.fromJSDate(date)
      .startOf('day')
      .diff(currentDate, ['day', 'hour'])
      .get('day') === 0;

  return (
    <div className={css.weekDay} id={`dayHeader-${date.getDay()}`}>
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
        />
      )}
      <DayItemContent
        date={date}
        events={events}
        resources={resources}
        renderEvent={renderEvent}
        eventExtraProps={eventExtraProps}
        components={components}
      />
    </div>
  );
};

export default WDayItem;
