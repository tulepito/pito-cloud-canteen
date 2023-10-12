import type { TObject } from '@src/utils/types';

import { EMenuMealType } from '../../../../../utils/enums';

export const MEAL_PRIORITIES: TObject<EMenuMealType, number> = {
  [EMenuMealType.breakfast]: 0,
  [EMenuMealType.lunch]: 1,
  [EMenuMealType.dinner]: 2,
  [EMenuMealType.snack]: 3,
};

export const prepareFoodListForOrder = ({
  daysOfWeek = [],
  mealTypes = [],
  mealType,
  foodByDate,
  isDraftEditFlow,
}: {
  mealTypes: string[];
  mealType: string;
  daysOfWeek: string[];
  isDraftEditFlow: boolean;
  foodByDate: TObject;
}) => {
  return daysOfWeek.reduce((prev, day) => {
    const foodListGroupByDateAndMeal = isDraftEditFlow
      ? mealTypes
          .reduce<TObject[]>((res, meal) => {
            if (foodByDate[meal] && foodByDate[meal][day]) {
              return res.concat({
                meal,
                foodList: foodByDate[meal][day],
              });
            }

            return res;
          }, [])
          .sort(
            (m1, m2) =>
              MEAL_PRIORITIES[m1.meal as EMenuMealType] -
              MEAL_PRIORITIES[m2.meal as EMenuMealType],
          )
      : foodByDate[day]
      ? [{ meal: mealType, foodList: foodByDate[day] }]
      : [];

    return { ...prev, [day]: foodListGroupByDateAndMeal };
  }, {});
};
