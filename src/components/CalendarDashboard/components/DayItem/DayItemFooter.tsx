import classNames from 'classnames';

import css from './DayItem.module.scss';

type TDayItemFooterProps = {
  isCurrentDay: boolean;
  date: Date;
  resources?: any;
  isSelectedDay?: boolean;
};

const DayItemFooter: React.FC<TDayItemFooterProps> = ({
  isCurrentDay,
  isSelectedDay,
  date,
}) => {
  return (
    <div className={css.dayFooter}>
      <div
        className={classNames(css.dayFooterIndex, {
          [css.activeDayFooterIndex]: isSelectedDay,
          [css.todayDayFooterIndex]: isCurrentDay,
        })}>
        {date.getDate()}
      </div>
    </div>
  );
};

export default DayItemFooter;
