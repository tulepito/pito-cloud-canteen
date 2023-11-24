import type { TFoodInRestaurant } from '@src/types/bookerSelectRestaurant';
import {
  FOOD_SIDE_DISH_OPTIONS,
  FOOD_SPECIAL_DIET_OPTIONS,
  FOOD_TYPE_OPTIONS,
  getLabelByKey,
  MENU_TYPE_OPTIONS,
} from '@src/utils/options';
import type { TIntegrationListing } from '@src/utils/types';

import { searchTitle } from './searchRestaurantHelper';

export const parseEntitiesToTableData = (
  foods: TIntegrationListing[],
  extraData: any,
  categoryOptions: any,
) => {
  return foods.map((food) => {
    return {
      key: food.id.uuid,
      data: {
        isDeleted: food.attributes.metadata.isDeleted,
        title: food.attributes.title,
        description: food.attributes.description,
        id: food.id.uuid,
        menuType: getLabelByKey(
          MENU_TYPE_OPTIONS,
          food.attributes.publicData.menuType,
        ),
        category: getLabelByKey(
          categoryOptions,
          food.attributes.publicData.category,
        ),
        foodType: getLabelByKey(
          FOOD_TYPE_OPTIONS,
          food.attributes.publicData.foodType,
        ),
        ...extraData,
      },
    };
  });
};

export const parseEntitiesToExportCsv = (
  foods: TIntegrationListing[],
  ids: string[],
  packagingOptions: any,
  categoryOptions: any,
) => {
  const filteredFoods =
    ids.length > 0 ? foods.filter((food) => ids.includes(food.id.uuid)) : foods;

  const foodsToExport = filteredFoods.map((food) => {
    const {
      publicData = {},
      description,
      title,
      price,
    } = food.attributes || {};
    const {
      sideDishes = [],
      specialDiets = [],
      category,
      foodType,
      menuType,
      allergicIngredients = [],
      maxQuantity,
      minOrderHourInAdvance,
      minQuantity,
      notes,
      unit,
      numberOfMainDishes,
      packaging,
    } = publicData;

    return {
      'Mã món': food.id.uuid,
      'Tên món ăn': title,
      'Mô tả': description,
      'Đơn giá': `${price?.amount} VND`,
      'Thành phần dị ứng': allergicIngredients.join(','),
      'Chất liệu bao bì': getLabelByKey(packagingOptions, packaging),
      'Phong cách ẩm thực': getLabelByKey(categoryOptions, category),
      'Loại món ăn': getLabelByKey(FOOD_TYPE_OPTIONS, foodType),
      'Loại menu': getLabelByKey(MENU_TYPE_OPTIONS, menuType),
      'Món ăn kèm': sideDishes
        .map((key: string) => getLabelByKey(FOOD_SIDE_DISH_OPTIONS, key))
        .join(','),
      'Chế độ dinh dưỡng đặc biệt': specialDiets
        .map((key: string) => getLabelByKey(FOOD_SPECIAL_DIET_OPTIONS, key))
        .join(','),
      'Số nguời tối đa': maxQuantity,
      'Giờ đặt trước tối thiểu': minOrderHourInAdvance,
      'Số lượng tối thiểu': minQuantity,
      'Ghi chú': notes,
      'Đơn vị tính': unit,
      'Số món chính': numberOfMainDishes,
      'Hình ảnh': food.images?.map(
        (image) => image.attributes.variants['square-small2x'].url,
      ),
    };
  });

  return foodsToExport;
};

export function sortFoodsInRestaurant(
  keywords: string | string[] | undefined,
  foods: TFoodInRestaurant[],
) {
  return foods
    ? foods.sort((first, second) => {
        if (keywords) {
          const strKeywords = Array.isArray(keywords)
            ? keywords.join(' ')
            : keywords;
          const firstFoundKeywords = searchTitle(first.foodName, strKeywords);
          const secondFoundKeywords = searchTitle(second.foodName, strKeywords);
          if (firstFoundKeywords !== secondFoundKeywords) {
            return firstFoundKeywords ? -1 : 1;
          }
        }
        if (first.price === second.price) return 0;
        if (first.price < second.price) return -1;

        return 1;
      })
    : [];
}
