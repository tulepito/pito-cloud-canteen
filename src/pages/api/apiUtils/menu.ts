import { getUniqueString } from '@src/utils/data';
import { getDayOfWeekByIndex } from '@src/utils/dates';

export const createMinPriceByDayOfWeek = (foodsByDate: any) => {
  let avaragePriceByDayOfWeek = {};
  Object.keys(foodsByDate).forEach((keyAsDate) => {
    let minPriceByDate = 0;
    Object.keys(foodsByDate[keyAsDate]).forEach((foodId, index) => {
      const { price = 0 } = foodsByDate[keyAsDate][foodId];
      if (index === 0) minPriceByDate = price;
      else {
        minPriceByDate = price < minPriceByDate ? price : minPriceByDate;
      }
    });
    const dayAsIndex = new Date(Number(keyAsDate)).getDay() - 1;
    const dayOfWeek = getDayOfWeekByIndex(dayAsIndex);
    avaragePriceByDayOfWeek = {
      ...avaragePriceByDayOfWeek,
      [`${dayOfWeek}MinFoodPrice`]: minPriceByDate || 0,
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

export const createSubmitFoodsByDate = (foodsByDate: any) => {
  let submitValues = {};
  Object.keys(foodsByDate).forEach((keyAsDate) => {
    const foodByDate = foodsByDate[keyAsDate];
    let newFoodByDate = {};
    Object.keys(foodByDate).forEach((k) => {
      const food = foodByDate[k];
      const { dayOfWeek, sideDishes = [], id, foodNote } = food;
      newFoodByDate = {
        ...newFoodByDate,
        [k]: {
          dayOfWeek,
          id,
          sideDishes,
          foodNote,
        },
      };
    });
    const dayAsIndex = new Date(Number(keyAsDate)).getDay() - 1;
    const dayOfWeek = getDayOfWeekByIndex(dayAsIndex);
    submitValues = {
      ...submitValues,
      [dayOfWeek]: {
        ...newFoodByDate,
      },
    };
  });

  return submitValues;
};

export const createListFoodNutritionByFoodsByDate = (foodsByDate: any) => {
  let nutritionsByDayOfWeek = {};
  Object.keys(foodsByDate).forEach((keyAsDate) => {
    let nutritionListByDate: string[] = [];
    Object.keys(foodsByDate[keyAsDate]).forEach((foodId) => {
      const { nutritionsList = [] } = foodsByDate[keyAsDate][foodId];
      nutritionListByDate = getUniqueString([
        ...nutritionListByDate,
        ...nutritionsList,
      ]);
    });
    const dayAsIndex = new Date(Number(keyAsDate)).getDay() - 1;
    const dayOfWeek = getDayOfWeekByIndex(dayAsIndex);
    nutritionsByDayOfWeek = {
      ...nutritionsByDayOfWeek,
      [`${dayOfWeek}Nutritions`]: nutritionListByDate,
    };
  });

  return nutritionsByDayOfWeek;
};

export const createListFoodIdsByFoodsByDate = (foodsByDate: any) => {
  let foodIdsByDayOfWeek = {};
  Object.keys(foodsByDate).forEach((keyAsDate) => {
    const listFoodIds: string[] = [];
    Object.keys(foodsByDate[keyAsDate]).forEach((foodId) => {
      listFoodIds.push(foodId);
    });
    const dayAsIndex = new Date(Number(keyAsDate)).getDay() - 1;
    const dayOfWeek = getDayOfWeekByIndex(dayAsIndex);
    foodIdsByDayOfWeek = {
      ...foodIdsByDayOfWeek,
      [`${dayOfWeek}FoodIdList`]: listFoodIds,
    };
  });

  return foodIdsByDayOfWeek;
};
