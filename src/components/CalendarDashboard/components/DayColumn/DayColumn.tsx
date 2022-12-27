import classNames from 'classnames';
import { FormattedMessage } from 'react-intl';

import css from './DayColumn.module.scss';

type TDayColumnProps = {
  date: Date;
};

const DayColumn: React.FC<TDayColumnProps> = ({ date }) => {
  const currentDay = new Date().getDay();
  return (
    <div className={css.root}>
      <div className={css.dayHeader}>
        <FormattedMessage
          id={`Calendar.week.dayHeader.${date.getDay()}`}
          values={{ date: date.getDate(), month: date.getMonth() + 1 }}
        />
      </div>
      <div className={css.dayContent}>asa</div>
      <div className={css.dayFooter}>
        <div
          className={classNames(css.dayFooterIndex, {
            [css.activeDayFooterIndex]: currentDay === date.getDay(),
          })}>
          {date.getDay() > 0 ? date.getDay() : 7}
        </div>
      </div>
    </div>
  );
};

export default DayColumn;
