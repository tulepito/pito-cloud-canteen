import { recommendFood } from '@pages/participant/orders/OrderList.slice';
import { Listing } from '@utils/data';
import type { TListing } from '@utils/types';

/**
 * Get the list of food ids from a list of foods
 */
export const getFoodIdList = (foods: TListing[]): string[] => {
  return foods.map((food: TListing) => Listing(food).getId());
};

/**
 * Pick a random food from a list of foods
 */
export const pickRandomFood = (foods: TListing[], allergies: string[]) => {
  if (!foods.length) {
    return undefined;
  }

  return recommendFood({
    foodList: foods,
    subOrderFoodIds: getFoodIdList(foods),
    allergies,
  });
};

/**
 * Pick a random food from a list of foods excluding a list of ids
 */
export const pickRandomFoodExcludingIds = (
  foods: TListing[],
  excludeIds: string[] = [],
  allergies: string[] = [],
) => {
  const filteredFoods = foods.filter((food: TListing) => {
    const foodId = Listing(food).getId();

    return !excludeIds.includes(foodId);
  });

  return pickRandomFood(filteredFoods, allergies);
};
