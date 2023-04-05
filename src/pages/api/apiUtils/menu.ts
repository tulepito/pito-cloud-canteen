import { getUniqueString } from '@src/utils/data';

export const createMinPriceByDayOfWeek = (foodsByDate: any) => {
  let avaragePriceByDayOfWeek = {};
  Object.keys(foodsByDate).forEach((keyAsDayOfWeek) => {
    let minPriceByDate = 0;
    Object.keys(foodsByDate[keyAsDayOfWeek]).forEach((foodId, index) => {
      const { price = 0 } = foodsByDate[keyAsDayOfWeek][foodId];
      if (index === 0) minPriceByDate = price;
      else {
        minPriceByDate = price < minPriceByDate ? price : minPriceByDate;
      }
    });
    avaragePriceByDayOfWeek = {
      ...avaragePriceByDayOfWeek,
      [`${keyAsDayOfWeek}MinFoodPrice`]: minPriceByDate || 0,
    };
  });

  return avaragePriceByDayOfWeek;
};

export const createFoodAveragePriceByDaysOfWeekField = (
  fieldsData: any,
  daysOfWeek: string[],
) => {
  const newData = Object.keys(fieldsData).reduce((prev, key) => {
    const substringKey = key.substring(0, 3);
    if (daysOfWeek.includes(substringKey)) {
      return { ...prev, [key]: fieldsData[key] };
    }

    return { ...prev, [key]: 0 };
  }, {});

  return newData;
};

export const createFoodByDateByDaysOfWeekField = (
  foodByDate: any,
  daysOfWeek: string[],
) => {
  const newFoodByDates = Object.keys(foodByDate).reduce((prev, key) => {
    if (daysOfWeek.includes(key)) {
      return { ...prev, [key]: foodByDate[key] };
    }

    return { ...prev };
  }, {});

  return newFoodByDates;
};

export const createFoodListIdByDaysOfWeekField = (
  fieldsData: any,
  daysOfWeek: string[],
) => {
  const newData = Object.keys(fieldsData).reduce((prev, key) => {
    const substringKey = key.substring(0, 3);
    if (daysOfWeek.includes(substringKey)) {
      return { ...prev, [key]: fieldsData[key] };
    }

    return { ...prev, [key]: [] };
  }, {});

  return newData;
};

export const createNutritionsByDaysOfWeekField = (
  fieldsData: any,
  daysOfWeek: string[],
) => {
  const newData = Object.keys(fieldsData).reduce((prev, key) => {
    const substringKey = key.substring(0, 3);
    if (daysOfWeek.includes(substringKey)) {
      return { ...prev, [key]: fieldsData[key] };
    }

    return { ...prev, [key]: [] };
  }, {});

  return newData;
};

export const createListFoodNutritionByFoodsByDate = (foodsByDate: any) => {
  let nutritionsByDayOfWeek = {};
  Object.keys(foodsByDate).forEach((keyAsDayOfWeek) => {
    let nutritionListByDate: string[] = [];
    Object.keys(foodsByDate[keyAsDayOfWeek]).forEach((foodId) => {
      const { nutritionsList = [] } = foodsByDate[keyAsDayOfWeek][foodId];
      nutritionListByDate = getUniqueString([
        ...nutritionListByDate,
        ...nutritionsList,
      ]);
    });
    nutritionsByDayOfWeek = {
      ...nutritionsByDayOfWeek,
      [`${keyAsDayOfWeek}Nutritions`]: nutritionListByDate,
    };
  });

  return nutritionsByDayOfWeek;
};

export const createListFoodIdsByFoodsByDate = (foodsByDate: any) => {
  let foodIdsByDayOfWeek = {};
  Object.keys(foodsByDate).forEach((keyAsDayOfWeek) => {
    const listFoodIds: string[] = [];
    Object.keys(foodsByDate[keyAsDayOfWeek]).forEach((foodId) => {
      listFoodIds.push(foodId);
    });
    foodIdsByDayOfWeek = {
      ...foodIdsByDayOfWeek,
      [`${keyAsDayOfWeek}FoodIdList`]: listFoodIds,
    };
  });

  return foodIdsByDayOfWeek;
};
