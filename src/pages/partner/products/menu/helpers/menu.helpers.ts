import type { TObject } from '@src/utils/types';

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
      ? mealTypes.reduce<TObject[]>((res, meal) => {
          if (foodByDate[meal] && foodByDate[meal][day]) {
            return res.concat({
              meal,
              foodList: foodByDate[meal][day],
            });
          }

          return res;
        }, [])
      : foodByDate[day]
      ? [{ meal: mealType, foodList: foodByDate[day] }]
      : [];

    return { ...prev, [day]: foodListGroupByDateAndMeal };
  }, {});
};
