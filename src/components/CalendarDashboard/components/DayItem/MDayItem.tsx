import type { Event } from 'react-big-calendar';
import { DateTime } from 'luxon';

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
};

const MDayItem: React.FC<TMDayItemProps> = ({
  date,
  events = [],
  renderEvent,
  components,
  resources,
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
        resources={resources}
        renderEvent={renderEvent}
        components={components}
      />
      <DayItemFooter
        resources={resources}
        date={date}
        isCurrentDay={isCurrentDay}
      />
    </div>
  );
};

export default MDayItem;
