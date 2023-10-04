import { useState } from 'react';
import classNames from 'classnames';
import isEmpty from 'lodash/isEmpty';

import IconAdd from '@components/Icons/IconAdd/IconAdd';
import IconCheckStatus from '@components/Icons/IconCheckStatus/IconCheckStatus';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import { EMenuMealType } from '@src/utils/enums';
import type { TObject } from '@src/utils/types';

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

const prepareFoodListForOrder = ({
  daysOfWeek = [],
  mealTypes = [],
  mealType,
  draftFoodByDate,
  foodsByDate,
  isDraftEditFlow,
}: {
  mealTypes: string[];
  mealType: string;
  daysOfWeek: string[];
  isDraftEditFlow: boolean;
  foodsByDate: TObject;
  draftFoodByDate: TObject;
}) => {
  return daysOfWeek.reduce((prev, day) => {
    const foodListGroupByDateAndMeal = isDraftEditFlow
      ? mealTypes.reduce<TObject[]>((res, meal) => {
          if (draftFoodByDate[meal] && draftFoodByDate[meal][day]) {
            return res.concat({
              meal,
              foodList: draftFoodByDate[meal][day],
            });
          }

          return res;
        }, [])
      : foodsByDate[day]
      ? [{ meal: mealType, foodList: foodsByDate[day] }]
      : [];

    return { ...prev, [day]: foodListGroupByDateAndMeal };
  }, {});
};

type TWeekDaysProps = {
  daysOfWeek?: string[];
  mealTypes?: string[];
  mealType: string;
  isDraftEditFlow: boolean;
  foodsByDate?: TObject;
  draftFoodByDate: TObject;
};

const WeekDays: React.FC<TWeekDaysProps> = (props) => {
  const {
    daysOfWeek = [],
    mealTypes = [],
    isDraftEditFlow,
    mealType = EMenuMealType.breakfast,
    foodsByDate = {},
    draftFoodByDate,
  } = props;
  const [currentDay, setCurrentDay] = useState(daysOfWeek[0]);

  const foodListByMealAndDay: TObject = prepareFoodListForOrder({
    daysOfWeek,
    mealTypes,
    draftFoodByDate,
    isDraftEditFlow,
    mealType,
    foodsByDate,
  });
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
          const isCurrentDay = currentDay === key;

          const hasAnyMealOfDayEmpty =
            !isItemDisabled &&
            foodListByMealAndDay[key].some(({ foodList }: TObject) => {
              return isEmpty(foodList);
            });

          const shouldShowIcon = !isCurrentDay && !isItemDisabled;

          const shouldShowCheckMarkIcon =
            !hasAnyMealOfDayEmpty && shouldShowIcon;
          const shouldShowAddIcon = hasAnyMealOfDayEmpty && shouldShowIcon;

          const dayItemClasses = classNames(css.dayItem, {
            [css.dayItemDisabled]: isItemDisabled,
            [css.currentDayItem]: isCurrentDay,
          });

          return (
            <div
              className={dayItemClasses}
              key={key}
              onClick={handleDayItemClick(key, isItemDisabled)}
              aria-disabled={isItemDisabled}>
              {label}

              <RenderWhen condition={shouldShowCheckMarkIcon}>
                <IconCheckStatus
                  className={classNames(css.icon, css.checkStatusIcon)}
                />
              </RenderWhen>
              <RenderWhen condition={shouldShowAddIcon}>
                <IconAdd
                  variant="withCircle"
                  className={classNames(css.icon)}
                />
              </RenderWhen>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeekDays;
