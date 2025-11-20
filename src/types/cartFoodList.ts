export type TCartFoodList = {
  [dayId: number]: {
    foodId: string;
    secondaryFoodId?: string;
  };
};
