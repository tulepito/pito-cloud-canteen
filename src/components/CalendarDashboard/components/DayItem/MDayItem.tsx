import type { Event } from 'react-big-calendar';

import css from './DayItem.module.scss';
import DayItemContent from './DayItemContent';
import DayItemFooter from './DayItemFooter';

type TMDayItemProps = {
  date: Date;
  events?: Event[];
  renderEvent?: React.FC<any>;
};

const MDayItem: React.FC<TMDayItemProps> = ({
  date,
  events = [],
  renderEvent,
}) => {
  const currentDay = new Date().getDate();
  const isCurrentDay = currentDay === date.getDate();

  return (
    <div className={css.monthDay}>
      <DayItemContent events={events} renderEvent={renderEvent} />
      <DayItemFooter date={date} isCurrentDay={isCurrentDay} />
    </div>
  );
};

export default MDayItem;
