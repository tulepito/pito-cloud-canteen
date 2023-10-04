import type { TObject } from '@src/utils/types';

export const prepareFoodListForOrder = ({
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
