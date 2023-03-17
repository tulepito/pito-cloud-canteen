/* eslint-disable @typescript-eslint/default-param-last */
import { DateTime } from 'luxon';

import { ListingTypes } from '@src/types/listingTypes';
import { getUniqueString, IntegrationListing } from '@utils/data';
import {
  addDaysToDate,
  addWeeksToDate,
  getDayOfWeekAsIndex,
  getDayOfWeekByIndex,
  getStartOfWeek,
} from '@utils/dates';
import type { EDayOfWeek } from '@utils/enums';
import { EListingStates, EMenuTypes } from '@utils/enums';
import type { TIntegrationListing } from '@utils/types';

export const MENU_INFORMATION_TAB = 'information';
export const MENU_PRICING_TAB = 'pricing';
export const MENU_COMPLETE_TAB = 'complete';

export const EDIT_PARTNER_MENU_TABS = [
  MENU_INFORMATION_TAB,
  MENU_PRICING_TAB,
  MENU_COMPLETE_TAB,
];

export type TEditMenuInformationFormValues = {
  startDate: Date;
  menuType: string;
  title: string;
  mealType: string;
  daysOfWeek: string[];
  numberOfCycles: number;
  endDate: Date;
};

export type TEditMenuPricingFormValues = {
  foodsByDate: any;
};

export type TEditMenuFormValues = TEditMenuPricingFormValues &
  TEditMenuInformationFormValues;

export type TCreateSubmitCreateMenuValues = TEditMenuFormValues & {
  restaurantId: string;
  menuId?: string;
};

export type TEditMenuPricingCalendarResources = {
  id: string;
  title: string;
  onRemovePickedFood?: (id: string, date: Date) => void;
  hideRemoveButton?: boolean;
  sideDishes: string[];
  price?: number;
  foodNote?: string;
};

const createFoodByDateByDaysOfWeekField = (
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

const createFoodAveragePriceByDaysOfWeekField = (
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

const createFoodListIdByDaysOfWeekField = (
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

const createNutritionsByDaysOfWeekField = (
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

export const createSubmitMenuValues = (
  values: TCreateSubmitCreateMenuValues,
  tab: string,
  menu?: TIntegrationListing | null,
) => {
  const {
    menuType,
    mealType,
    startDate,
    daysOfWeek,
    restaurantId,
    foodsByDate,
    title,
    numberOfCycles,
    endDate,
  } = values;
  const isCycleMenu = menuType === EMenuTypes.cycleMenu;

  const {
    foodsByDate: foodsByDateFromMenu = {},
    monMinFoodPrice: monMinFoodPriceFromMenu = 0,
    tueMinFoodPrice: tueMinFoodPriceFromMenu = 0,
    wedMinFoodPrice: wedMinFoodPriceFromMenu = 0,
    thuMinFoodPrice: thuMinFoodPriceFromMenu = 0,
    friMinFoodPrice: friMinFoodPriceFromMenu = 0,
    satMinFoodPrice: satMinFoodPriceFromMenu = 0,
    sunMinFoodPrice: sunMinFoodPriceFromMenu = 0,
  } = IntegrationListing(menu).getPublicData();

  const { listingState } = IntegrationListing(menu).getMetadata();
  const {
    monFoodIdList: monFoodIdListFromMenu = [],
    tueFoodIdList: tueFoodIdListFromMenu = [],
    wedFoodIdList: wedFoodIdListFromMenu = [],
    thuFoodIdList: thuFoodIdListFromMenu = [],
    friFoodIdList: friFoodIdListFromMenu = [],
    satFoodIdList: satFoodIdListFromMenu = [],
    sunFoodIdList: sunFoodIdListFromMenu = [],
    /// //
    monNutritions: monNutritionsFromMenu = [],
    tueNutritions: tueNutritionsFromMenu = [],
    wedNutritions: wedNutritionsFromMenu = [],
    thuNutritions: thuNutritionsFromMenu = [],
    friNutritions: friNutritionsFromMenu = [],
    satNutritions: satNutritionsFromMenu = [],
    sunNutritions: sunNutritionsFromMenu = [],
  } = IntegrationListing(menu).getMetadata();

  const alreadyPublished = listingState === EListingStates.published;
  const endDateToSubmit = isCycleMenu
    ? addWeeksToDate(new Date(startDate), numberOfCycles).getTime()
    : endDate;

  switch (tab) {
    case MENU_INFORMATION_TAB: {
      return {
        title,
        publicData: {
          daysOfWeek,
          mealType,
          startDate,
          endDate: endDateToSubmit,
          ...(isCycleMenu ? { numberOfCycles } : {}),
          ...(restaurantId
            ? {
                foodsByDate: createFoodByDateByDaysOfWeekField(
                  foodsByDateFromMenu,
                  daysOfWeek,
                ),
                ...createFoodAveragePriceByDaysOfWeekField(
                  {
                    monMinFoodPrice: monMinFoodPriceFromMenu,
                    tueMinFoodPrice: tueMinFoodPriceFromMenu,
                    wedMinFoodPrice: wedMinFoodPriceFromMenu,
                    thuMinFoodPrice: thuMinFoodPriceFromMenu,
                    friMinFoodPrice: friMinFoodPriceFromMenu,
                    satMinFoodPrice: satMinFoodPriceFromMenu,
                    sunMinFoodPrice: sunMinFoodPriceFromMenu,
                  },
                  daysOfWeek,
                ),
              }
            : {}),
        },
        metadata: {
          menuType,
          listingType: ListingTypes.MENU,
          restaurantId,
          ...(!alreadyPublished ? { listingState: EListingStates.draft } : {}),
          ...(restaurantId
            ? {
                ...createFoodListIdByDaysOfWeekField(
                  {
                    monFoodIdList: monFoodIdListFromMenu,
                    tueFoodIdList: tueFoodIdListFromMenu,
                    wedFoodIdList: wedFoodIdListFromMenu,
                    thuFoodIdList: thuFoodIdListFromMenu,
                    friFoodIdList: friFoodIdListFromMenu,
                    satFoodIdList: satFoodIdListFromMenu,
                    sunFoodIdList: sunFoodIdListFromMenu,
                  },
                  daysOfWeek,
                ),
                ...createNutritionsByDaysOfWeekField(
                  {
                    monNutritions: monNutritionsFromMenu,
                    tueNutritions: tueNutritionsFromMenu,
                    wedNutritions: wedNutritionsFromMenu,
                    thuNutritions: thuNutritionsFromMenu,
                    friNutritions: friNutritionsFromMenu,
                    satNutritions: satNutritionsFromMenu,
                    sunNutritions: sunNutritionsFromMenu,
                  },
                  daysOfWeek,
                ),
              }
            : {}),
        },
      };
    }
    case MENU_PRICING_TAB: {
      return {
        publicData: {
          ...createMinPriceByDayOfWeek(foodsByDate),
          foodsByDate: createSubmitFoodsByDate(foodsByDate),
        },
        metadata: {
          ...createListFoodIdsByFoodsByDate(foodsByDate),
          ...createListFoodNutritionByFoodsByDate(foodsByDate),
        },
      };
    }
    case MENU_COMPLETE_TAB: {
      return {
        publicData: {
          ...createMinPriceByDayOfWeek(foodsByDate),
          foodsByDate: createSubmitFoodsByDate(foodsByDate),
        },
        metadata: {
          ...createListFoodIdsByFoodsByDate(foodsByDate),
          ...createListFoodNutritionByFoodsByDate(foodsByDate),
          listingState: EListingStates.published,
        },
      };
    }
    default:
      return {};
  }
};

export const createDuplicateSubmitMenuValues = (
  values: TCreateSubmitCreateMenuValues,
  menu: TIntegrationListing,
  tab: string,
) => {
  const {
    menuType,
    mealType,
    startDate,
    daysOfWeek,
    restaurantId,
    foodsByDate,
    title,
    numberOfCycles,
    endDate,
  } = values;
  const isCycleMenu = menuType === EMenuTypes.cycleMenu;

  const { title: titleFromMenu } = IntegrationListing(menu).getAttributes();

  const {
    mealType: mealTyperFromMenu,
    startDate: startDateFromMenu,
    numberOfCycles: numberOfCyclesFromMenu,
    monMinFoodPrice: monMinFoodPriceFromMenu,
    tueMinFoodPrice: tueMinFoodPriceFromMenu,
    wedMinFoodPrice: wedMinFoodPriceFromMenu,
    thuMinFoodPrice: thuMinFoodPriceFromMenu,
    friMinFoodPrice: friMinFoodPriceFromMenu,
    satMinFoodPrice: satMinFoodPriceFromMenu,
    sunMinFoodPrice: sunMinFoodPriceFromMenu,
    daysOfWeek: daysOfWeekFromMenu,
    foodsByDate: foodsByDateFromMenu,
  } = IntegrationListing(menu).getPublicData();

  const {
    monFoodIdList: monFoodIdListFromMenu,
    tueFoodIdList: tueFoodIdListFromMenu,
    wedFoodIdList: wedFoodIdListFromMenu,
    thuFoodIdList: thuFoodIdListFromMenu,
    friFoodIdList: friFoodIdListFromMenu,
    satFoodIdList: satFoodIdListFromMenu,
    sunFoodIdList: sunFoodIdListFromMenu,
    /// /
    monNutritions: monNutritionsFromMenu = [],
    tueNutritions: tueNutritionsFromMenu = [],
    wedNutritions: wedNutritionsFromMenu = [],
    thuNutritions: thuNutritionsFromMenu = [],
    friNutritions: friNutritionsFromMenu = [],
    satNutritions: satNutritionsFromMenu = [],
    sunNutritions: sunNutritionsFromMenu = [],
  } = IntegrationListing(menu).getMetadata();

  const { menuType: menuTypeFromMenu } = IntegrationListing(menu).getMetadata();

  const endDateFromMenu =
    menuTypeFromMenu === EMenuTypes.cycleMenu &&
    addWeeksToDate(
      new Date(startDateFromMenu),
      numberOfCyclesFromMenu,
    ).getTime();

  const endDateToSubmit = isCycleMenu
    ? addWeeksToDate(new Date(startDate), numberOfCycles).getTime()
    : endDate;

  switch (tab) {
    case MENU_INFORMATION_TAB: {
      return {
        title,
        publicData: {
          daysOfWeek,
          mealType,
          startDate,
          endDate: endDateToSubmit,
          ...(isCycleMenu ? { numberOfCycles } : {}),
          foodsByDate: createFoodByDateByDaysOfWeekField(
            foodsByDateFromMenu,
            daysOfWeek,
          ),
          ...createFoodAveragePriceByDaysOfWeekField(
            {
              monMinFoodPrice: monMinFoodPriceFromMenu,
              tueMinFoodPrice: tueMinFoodPriceFromMenu,
              wedMinFoodPrice: wedMinFoodPriceFromMenu,
              thuMinFoodPrice: thuMinFoodPriceFromMenu,
              friMinFoodPrice: friMinFoodPriceFromMenu,
              satMinFoodPrice: satMinFoodPriceFromMenu,
              sunMinFoodPrice: sunMinFoodPriceFromMenu,
            },
            daysOfWeek,
          ),
        },
        metadata: {
          ...createFoodListIdByDaysOfWeekField(
            {
              monFoodIdList: monFoodIdListFromMenu,
              tueFoodIdList: tueFoodIdListFromMenu,
              wedFoodIdList: wedFoodIdListFromMenu,
              thuFoodIdList: thuFoodIdListFromMenu,
              friFoodIdList: friFoodIdListFromMenu,
              satFoodIdList: satFoodIdListFromMenu,
              sunFoodIdList: sunFoodIdListFromMenu,
            },
            daysOfWeek,
          ),
          ...createNutritionsByDaysOfWeekField(
            {
              monNutritions: monNutritionsFromMenu,
              tueNutritions: tueNutritionsFromMenu,
              wedNutritions: wedNutritionsFromMenu,
              thuNutritions: thuNutritionsFromMenu,
              friNutritions: friNutritionsFromMenu,
              satNutritions: satNutritionsFromMenu,
              sunNutritions: sunNutritionsFromMenu,
            },
            daysOfWeek,
          ),
          menuType,
          listingType: ListingTypes.MENU,
          restaurantId,
          listingState: EListingStates.draft,
        },
      };
    }
    case MENU_PRICING_TAB: {
      return {
        title: titleFromMenu,
        publicData: {
          ...createMinPriceByDayOfWeek(foodsByDate),
          foodsByDate: createSubmitFoodsByDate(foodsByDate),
          daysOfWeek: daysOfWeekFromMenu,
          mealType: mealTyperFromMenu,
          startDate: startDateFromMenu,
          endDate: endDateFromMenu,
          ...(menuTypeFromMenu === EMenuTypes.cycleMenu
            ? { numberOfCycles: numberOfCyclesFromMenu }
            : {}),
        },
        metadata: {
          ...createListFoodIdsByFoodsByDate(foodsByDate),
          ...createListFoodNutritionByFoodsByDate(foodsByDate),
          menuType: menuTypeFromMenu,
          listingType: ListingTypes.MENU,
          restaurantId,
          listingState: EListingStates.draft,
        },
      };
    }
    case MENU_COMPLETE_TAB: {
      return {
        title: titleFromMenu,
        publicData: {
          ...createMinPriceByDayOfWeek(foodsByDate),
          foodsByDate: createSubmitFoodsByDate(foodsByDate),
          daysOfWeek: daysOfWeekFromMenu,
          mealType: mealTyperFromMenu,
          startDate: startDateFromMenu,
          endDate: endDateFromMenu,
          ...(menuTypeFromMenu === EMenuTypes.cycleMenu
            ? { numberOfCycles: numberOfCyclesFromMenu }
            : {}),
        },
        metadata: {
          ...createListFoodIdsByFoodsByDate(foodsByDate),
          ...createListFoodNutritionByFoodsByDate(foodsByDate),
          /// /
          listingState: EListingStates.published,
          menuType: menuTypeFromMenu,
          listingType: ListingTypes.MENU,
          restaurantId,
        },
      };
    }
    default:
      return {};
  }
};

export const createUpdateMenuApplyTimeValues = (values: any) => {
  const {
    menuType,
    startDate,
    endDate,
    daysOfWeek,
    id,
    numberOfCycles,
    monMinFoodPrice = 0,
    tueMinFoodPrice = 0,
    wedMinFoodPrice = 0,
    thuMinFoodPrice = 0,
    friMinFoodPrice = 0,
    satMinFoodPrice = 0,
    sunMinFoodPrice = 0,
    monFoodIdList = [],
    tueFoodIdList = [],
    wedFoodIdList = [],
    thuFoodIdList = [],
    friFoodIdList = [],
    satFoodIdList = [],
    sunFoodIdList = [],
    foodsByDate = {},
    restaurantId,
    mealType,
  } = values;

  const isCycleMenu = menuType === EMenuTypes.cycleMenu;
  const endDateToSubmit = isCycleMenu
    ? addWeeksToDate(new Date(startDate), numberOfCycles).getTime()
    : endDate;

  return {
    id,
    publicData: {
      startDate,
      daysOfWeek,
      mealType,
      endDate: endDateToSubmit,
      ...(isCycleMenu ? { numberOfCycles } : {}),
      foodsByDate: createFoodByDateByDaysOfWeekField(foodsByDate, daysOfWeek),
      ...createFoodAveragePriceByDaysOfWeekField(
        {
          monMinFoodPrice,
          tueMinFoodPrice,
          wedMinFoodPrice,
          thuMinFoodPrice,
          friMinFoodPrice,
          satMinFoodPrice,
          sunMinFoodPrice,
        },
        daysOfWeek,
      ),
    },
    metadata: {
      restaurantId,
      ...createFoodListIdByDaysOfWeekField(
        {
          monFoodIdList,
          tueFoodIdList,
          wedFoodIdList,
          thuFoodIdList,
          friFoodIdList,
          satFoodIdList,
          sunFoodIdList,
        },
        daysOfWeek,
      ),
      ...createNutritionsByDaysOfWeekField(
        {
          monFoodIdList,
          tueFoodIdList,
          wedFoodIdList,
          thuFoodIdList,
          friFoodIdList,
          satFoodIdList,
          sunFoodIdList,
        },
        daysOfWeek,
      ),
    },
  };
};

export const createInitialValuesForFoodsByDate = (
  foodListIdsByDate: any = {},
) => {
  return Object.keys(foodListIdsByDate).reduce(
    (prev: any, currentKey: string) => {
      const dayOfWeek = currentKey.substring(0, 3);
      const listIds = foodListIdsByDate?.[currentKey] || [];
      const listIdsAsMap = listIds.reduce((prevList: any, cur: string) => {
        return {
          ...prevList,
          [cur]: {
            id: cur,
          },
        };
      }, {});

      return {
        ...prev,
        [dayOfWeek]: listIdsAsMap,
      };
    },
    {},
  );
};

export const renderValuesForFoodsByDate = (
  foodsByDate: any = {},
  anchorDate: Date,
  menuPickedFoods: TIntegrationListing[] = [],
) => {
  let initialValue = {};
  const startDayOfWeek = getStartOfWeek(anchorDate.getTime());
  Object.keys(foodsByDate).forEach((dayOfWeeks) => {
    const dayOfWeekAsNumber = getDayOfWeekAsIndex(dayOfWeeks as EDayOfWeek);
    const daysOfCurrentWeek = addDaysToDate(startDayOfWeek, dayOfWeekAsNumber);
    const foodByDate = foodsByDate[dayOfWeeks];
    let newFoodByDate = {};
    Object.keys(foodByDate).forEach((idAsKey) => {
      const food = foodByDate[idAsKey];

      const { id } = food;
      const foodFromDuck = menuPickedFoods.find((m) => m.id.uuid === id);
      const title = foodFromDuck?.attributes.title;
      const price = foodFromDuck?.attributes.price?.amount || 0;

      newFoodByDate = {
        ...newFoodByDate,
        [idAsKey]: {
          title,
          id,
          price,
          ...food,
        },
      };
    });

    const dateInTimeStaimp = daysOfCurrentWeek.getTime();
    initialValue = {
      ...initialValue,
      [dateInTimeStaimp]: {
        ...newFoodByDate,
      },
    };
  });

  return initialValue;
};

export const renderResourcesForCalendar = (
  foodsByDate: any = {},
  extraData: {
    onRemovePickedFood: (id: string, date: Date) => void;
    daysOfWeek: string[];
  },
) => {
  const resourses: {
    resource: TEditMenuPricingCalendarResources;
    start: Date;
    end: Date;
  }[] = [];

  Object.keys(foodsByDate).forEach((key) => {
    Object.keys(foodsByDate[key]).forEach((foodKey) => {
      resourses.push({
        resource: {
          id: foodsByDate[key][foodKey]?.id,
          title: foodsByDate[key][foodKey]?.title,
          sideDishes: foodsByDate[key][foodKey]?.sideDishes || [],
          price: foodsByDate[key][foodKey]?.price || 0,
          foodNote: foodsByDate[key][foodKey]?.foodNote || '',
          ...extraData,
        },
        start: DateTime.fromMillis(Number(key)).toJSDate(),
        end: DateTime.fromMillis(Number(key)).plus({ hour: 1 }).toJSDate(),
      });
    });
  });

  return resourses;
};
