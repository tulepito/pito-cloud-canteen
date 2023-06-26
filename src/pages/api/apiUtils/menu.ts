import { denormalisedResponseEntities } from '@services/data';
import { getIntegrationSdk } from '@services/sdk';
import { getUniqueString, Listing } from '@src/utils/data';
import type { TListing } from '@src/utils/types';

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

export const createListFoodTypeByFoodIds = async (listFoodIdsByDate: any) => {
  const integrationSdk = getIntegrationSdk();
  const listFoodTypesByDay = await new Promise((resolve, reject) => {
    let result = {};
    const dayKeyAsArray = Object.keys(listFoodIdsByDate);
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
