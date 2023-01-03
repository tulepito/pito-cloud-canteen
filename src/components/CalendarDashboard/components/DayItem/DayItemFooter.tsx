import classNames from 'classnames';

import css from './DayItem.module.scss';

type TDayItemFooterProps = {
  isCurrentDay: boolean;
  date: Date;
};

const DayItemFooter: React.FC<TDayItemFooterProps> = ({
  isCurrentDay,
  date,
}) => {
  return (
    <div className={css.dayFooter}>
      <div
        className={classNames(css.dayFooterIndex, {
          [css.activeDayFooterIndex]: isCurrentDay,
        })}>
        {date.getDate()}
      </div>
    </div>
  );
};

export default DayItemFooter;
