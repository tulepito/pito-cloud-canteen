import classNames from 'classnames';

import css from './DayBox.module.scss';

type TDayBoxFooterProps = {
  isCurrentDay: boolean;
  date: Date;
};

const DayBoxFooter: React.FC<TDayBoxFooterProps> = ({ isCurrentDay, date }) => {
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

export default DayBoxFooter;
