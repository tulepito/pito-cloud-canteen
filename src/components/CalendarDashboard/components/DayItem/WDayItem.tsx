import { DateTime } from 'luxon';
import type { Event } from 'react-big-calendar';

import type { TCalendarItemCardComponents } from '../../helpers/types';
import css from './DayItem.module.scss';
import DayItemContent from './DayItemContent';
import DayItemHeader from './DayItemHeader';

type TWDayItemProps = {
  date: Date;
  events?: Event[];
  renderEvent?: React.FC<any>;
  components?: TCalendarItemCardComponents;
};

const WDayItem: React.FC<TWDayItemProps> = ({
  date,
  events = [],
  renderEvent,
  components,
}) => {
  const currentDate = DateTime.fromJSDate(new Date()).startOf('day');
  const isCurrentDay =
    DateTime.fromJSDate(date)
      .startOf('day')
      .diff(currentDate, ['day', 'hour'])
      .get('day') === 0;

  return (
    <div className={css.weekDay} id={`dayHeader-${date.getDay()}`}>
      <DayItemHeader date={date} isCurrentDay={isCurrentDay} />
      <DayItemContent
        events={events}
        renderEvent={renderEvent}
        components={components}
      />
    </div>
  );
};

export default WDayItem;
