import type { Event } from 'react-big-calendar';

import css from './DayBox.module.scss';
import DayBoxContent from './DayBoxContent';
import DayBoxFooter from './DayBoxFooter';

type TDayBoxProps = {
  date: Date;
  events?: Event[];
};

const DayBox: React.FC<TDayBoxProps> = ({ date, events = [] }) => {
  const currentDay = new Date().getDate();
  const isCurrentDay = currentDay === date.getDate();

  return (
    <div className={css.root}>
      <DayBoxContent events={events} />
      <DayBoxFooter date={date} isCurrentDay={isCurrentDay} />
    </div>
  );
};

export default DayBox;
