import isEmpty from 'lodash/isEmpty';

import { denormalisedResponseEntities } from '@services/data';
import { getIntegrationSdk } from '@services/sdk';
import { getUniqueString, Listing } from '@src/utils/data';
import type { EMenuMealType } from '@src/utils/enums';
import type { TListing, TObject } from '@src/utils/types';

export const createMinPriceByDayOfWeek = (foodsByDate: any) => {
  let averagePriceByDayOfWeek = {};
  Object.keys(foodsByDate).forEach((keyAsDayOfWeek) => {
    let minPriceByDate = 0;
    Object.keys(foodsByDate[keyAsDayOfWeek]).forEach((foodId, index) => {
      const { price = 0 } = foodsByDate[keyAsDayOfWeek][foodId] || {};
      if (index === 0) minPriceByDate = price;
      else {
        minPriceByDate = price < minPriceByDate ? price : minPriceByDate;
      }
    });
    averagePriceByDayOfWeek = {
      ...averagePriceByDayOfWeek,
      [`${keyAsDayOfWeek}MinFoodPrice`]: minPriceByDate || 0,
    };
  });

  return averagePriceByDayOfWeek;
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

export const createPartnerDraftFoodByDateByDaysOfWeekField = (
  daysOfWeek: string[],
  mealTypes: EMenuMealType[] = [],
  currentDraftFoodByDate: TObject = {},
) => {
  return mealTypes.reduce((prev, meal) => {
    const currMealDataMaybe = currentDraftFoodByDate[meal] || {};

    const newFoodByDates = daysOfWeek.reduce((res, day) => {
      return { ...res, [day]: currMealDataMaybe[day] || {} };
    }, {});

    return { ...prev, [meal]: newFoodByDates };
  }, {});
};

export const createFoodByDateByDaysOfWeekField = (
  foodByDate: any,
  daysOfWeek: string[],
) => {
  const newFoodByDates = daysOfWeek.reduce((prev, key) => {
    return { ...prev, [key]: foodByDate[key] || {} };
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
      const { nutritionsList = [] } = foodsByDate[keyAsDayOfWeek][foodId] || {};
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

export const createListFoodTypeByFoodIds = async (listFoodIdsByDate: any) => {
  const integrationSdk = getIntegrationSdk();
  const listFoodTypesByDay = await new Promise((resolve, reject) => {
    let result = {};
    const dayKeyAsArray = Object.keys(listFoodIdsByDate);

    if (isEmpty(dayKeyAsArray)) {
      resolve(null);
    }
    dayKeyAsArray.map(async (key, index) => {
      try {
        const substringKey = key.substring(0, 3);

        const foodIds = listFoodIdsByDate[key];
        const response = await integrationSdk.listings.query({
          ids: foodIds.slice(0, 50),
        });
        const listings = denormalisedResponseEntities(response);
        // eslint-disable-next-line @typescript-eslint/no-shadow
        const foodTypes = listings.reduce((prev: string[], l: TListing) => {
          const { foodType } = Listing(l).getPublicData();

          if (!foodType) return prev;

          return [...prev, foodType];
        }, [] as string[]);

        result = {
          ...result,
          [`${substringKey}FoodType`]: getUniqueString(foodTypes),
        };
        if (index === dayKeyAsArray.length - 1) {
          resolve(result);
        }
      } catch (error) {
        reject();
      }
    });
  });

  return listFoodTypesByDay || {};
};
