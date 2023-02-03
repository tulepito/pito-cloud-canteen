import classNames from 'classnames';
import { FormattedMessage } from 'react-intl';

import css from './DayItem.module.scss';

type TDayColumnHeaderProps = {
  isCurrentDay: boolean;
  date: Date;
  isMouseOnDay: boolean;
};

const DayColumnHeader: React.FC<TDayColumnHeaderProps> = ({
  isCurrentDay,
  date,
  isMouseOnDay,
}) => {
  return (
    <div
      className={classNames(css.dayHeader, {
        [css.activeHeader]: isCurrentDay || isMouseOnDay,
      })}>
      <div className={css.dateNumber}>{date.getDate()}</div>
      <div className={css.dayText}>
        <FormattedMessage
          id={`Calendar.week.dayHeader.${date.getDay()}`}
          values={{ date: date.getDate(), month: date.getMonth() + 1 }}
        />
      </div>
    </div>
  );
};

export default DayColumnHeader;
