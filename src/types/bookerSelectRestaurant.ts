export type CombinedRestaurantMenuData = {
  restaurantId: string;
  menuId: string;
};

export type KeywordsCombinedMenuData = CombinedRestaurantMenuData & {
  foundKeywordsTitle: boolean;
};

export type TFoodInRestaurant = {
  foodId: string;
  restaurantId: string;
  price: number;
  minQuantity: number;
  foodName: string;
};
