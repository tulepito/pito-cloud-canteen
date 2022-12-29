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
  const currentDay = new Date().getDay();
  const isCurrentDay = currentDay === date.getDay();

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
