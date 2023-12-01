import {
  AFTERNOON_SESSION,
  DINNER_SESSION,
  EVENING_SESSION,
  MORNING_SESSION,
} from '@components/CalendarDashboard/helpers/constant';
import { EFoodType } from '@src/utils/enums';

export const deliveryDaySessionAdapter = (daySession: string) => {
  switch (daySession) {
    case MORNING_SESSION:
      return 'breakfast';
    case DINNER_SESSION:
    case EVENING_SESSION:
      return 'dinner';
    case AFTERNOON_SESSION:
      return 'lunch';

    default:
      break;
  }
};

export const mealTypeAdapter = (mealType: string) => {
  switch (mealType) {
    case 'vegetarian':
      return EFoodType.vegetarianDish;
    case 'unVegetarian':
      return EFoodType.savoryDish;
    default:
      return '';
  }
};

export const mealTypeReverseAdapter = (mealType: string) => {
  switch (mealType) {
    case EFoodType.vegetarianDish:
      return 'vegetarian';
    case EFoodType.savoryDish:
      return 'unVegetarian';
    default:
      return '';
  }
};
