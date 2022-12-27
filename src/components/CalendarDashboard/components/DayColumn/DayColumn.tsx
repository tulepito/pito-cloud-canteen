import type { Event } from 'react-big-calendar';

import css from './DayColumn.module.scss';
import DayColumnContent from './DayColumnContent';
import DayColumnFooter from './DayColumnFooter';
import DayColumnHeader from './DayColumnHeader';

type TDayColumnProps = {
  date: Date;
  events?: Event[];
};

const DayColumn: React.FC<TDayColumnProps> = ({ date, events = [] }) => {
  const currentDay = new Date().getDay();
  const isCurrentDay = currentDay === date.getDay();

  return (
    <div className={css.root}>
      <DayColumnHeader date={date} isCurrentDay={isCurrentDay} />
      <DayColumnContent events={events} />
      <DayColumnFooter date={date} isCurrentDay={isCurrentDay} />
    </div>
  );
};

export default DayColumn;
