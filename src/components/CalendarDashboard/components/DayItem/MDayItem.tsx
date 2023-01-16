import { DateTime } from 'luxon';
import type { Event } from 'react-big-calendar';

import type { TCalendarItemCardComponents } from '../../helpers/types';
import css from './DayItem.module.scss';
import DayItemContent from './DayItemContent';
import DayItemFooter from './DayItemFooter';

type TMDayItemProps = {
  date: Date;
  events?: Event[];
  renderEvent?: React.FC<any>;
  components?: TCalendarItemCardComponents;
};

const MDayItem: React.FC<TMDayItemProps> = ({
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
    <div className={css.monthDay}>
      <DayItemContent
        date={date}
        events={events}
        renderEvent={renderEvent}
        components={components}
      />
      <DayItemFooter date={date} isCurrentDay={isCurrentDay} />
    </div>
  );
};

export default MDayItem;
