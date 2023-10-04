import { useState } from 'react';
import classNames from 'classnames';

import css from './WeekDays.module.scss';

const ALL_WEEK_DAYS = [
  { key: 'mon', label: 'T2' },
  { key: 'tue', label: 'T3' },
  { key: 'wed', label: 'T4' },
  { key: 'thu', label: 'T5' },
  { key: 'fri', label: 'T6' },
  { key: 'sat', label: 'T7' },
  { key: 'sun', label: 'CN' },
];

type TWeekDaysProps = {
  daysOfWeek?: string[];
};

const WeekDays: React.FC<TWeekDaysProps> = (props) => {
  const { daysOfWeek = [] } = props;
  const [currentDay, setCurrentDay] = useState(daysOfWeek[0]);

  const handleDayItemClick =
    (key: string, isDisabled = false) =>
    () => {
      if (!isDisabled) {
        setCurrentDay(key);
      }
    };

  return (
    <div className={css.root}>
      <div className={css.dayContainer}>
        {ALL_WEEK_DAYS.map(({ key, label }) => {
          const isItemDisabled = !daysOfWeek.includes(key);

          const dayItemClasses = classNames(css.dayItem, {
            [css.dayItemDisabled]: isItemDisabled,
            [css.currentDayItem]: currentDay === key,
          });

          return (
            <div
              className={dayItemClasses}
              key={key}
              onClick={handleDayItemClick(key, isItemDisabled)}
              aria-disabled={isItemDisabled}>
              {label}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeekDays;
