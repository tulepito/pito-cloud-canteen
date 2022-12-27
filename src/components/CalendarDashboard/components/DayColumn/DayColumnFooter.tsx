import classNames from 'classnames';

import css from './DayColumn.module.scss';

type TDayColumnFooterProps = {
  isCurrentDay: boolean;
  date: Date;
};

const DayColumnFooter: React.FC<TDayColumnFooterProps> = ({
  isCurrentDay,
  date,
}) => {
  return (
    <div className={css.dayFooter}>
      <div
        className={classNames(css.dayFooterIndex, {
          [css.activeDayFooterIndex]: isCurrentDay,
        })}>
        {date.getDay() > 0 ? date.getDay() : 7}
      </div>
    </div>
  );
};

export default DayColumnFooter;
