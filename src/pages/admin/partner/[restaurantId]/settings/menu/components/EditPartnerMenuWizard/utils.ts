/* eslint-disable @typescript-eslint/default-param-last */
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

export const createAvaragePriceByFoodsByDate = (foodsByDate: any) => {
  let avaragePriceByDayOfWeek = {};
  Object.keys(foodsByDate).forEach((keyAsDate) => {
    let totalPriceByDate = 0;
    let totalFoodLengthByDate = 0;
    Object.keys(foodsByDate[keyAsDate]).forEach((foodId) => {
      const { price = 0 } = foodsByDate[keyAsDate][foodId];
      totalPriceByDate = price + totalPriceByDate;
      totalFoodLengthByDate += 1;
    });
    const priceAverage = totalPriceByDate / totalFoodLengthByDate;
    const dayAsIndex = new Date(Number(keyAsDate)).getDay() - 1;
    const dayOfWeek = getDayOfWeekByIndex(dayAsIndex);
    avaragePriceByDayOfWeek = {
      ...avaragePriceByDayOfWeek,
      [`${dayOfWeek}AverageFoodPrice`]: priceAverage || 0,
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
  } = values;
  const isCycleMenu = menuType === EMenuTypes.cycleMenu;

  const {
    foodsByDate: foodsByDateFromMenu = {},
    monAverageFoodPrice: monAverageFoodPriceFromMenu = 0,
    tueAverageFoodPrice: tueAverageFoodPriceFromMenu = 0,
    wedAverageFoodPrice: wedAverageFoodPriceFromMenu = 0,
    thuAverageFoodPrice: thuAverageFoodPriceFromMenu = 0,
    friAverageFoodPrice: friAverageFoodPriceFromMenu = 0,
    satAverageFoodPrice: satAverageFoodPriceFromMenu = 0,
    sunAverageFoodPrice: sunAverageFoodPriceFromMenu = 0,
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
  const endDate =
    isCycleMenu &&
    addWeeksToDate(new Date(startDate), numberOfCycles).getTime();

  switch (tab) {
    case MENU_INFORMATION_TAB: {
      return {
        title,
        publicData: {
          daysOfWeek,
          mealType,
          startDate,
          ...(endDate ? { endDate } : {}),
          ...(isCycleMenu ? { numberOfCycles } : {}),
          ...(restaurantId
            ? {
                foodsByDate: createFoodByDateByDaysOfWeekField(
                  foodsByDateFromMenu,
                  daysOfWeek,
                ),
                ...createFoodAveragePriceByDaysOfWeekField(
                  {
                    monAverageFoodPrice: monAverageFoodPriceFromMenu,
                    tueAverageFoodPrice: tueAverageFoodPriceFromMenu,
                    wedAverageFoodPrice: wedAverageFoodPriceFromMenu,
                    thuAverageFoodPrice: thuAverageFoodPriceFromMenu,
                    friAverageFoodPrice: friAverageFoodPriceFromMenu,
                    satAverageFoodPrice: satAverageFoodPriceFromMenu,
                    sunAverageFoodPrice: sunAverageFoodPriceFromMenu,
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
          ...createAvaragePriceByFoodsByDate(foodsByDate),
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
        metadata: {
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
  } = values;
  const isCycleMenu = menuType === EMenuTypes.cycleMenu;

  const { title: titleFromMenu } = IntegrationListing(menu).getAttributes();

  const {
    mealType: mealTyperFromMenu,
    startDate: startDateFromMenu,
    numberOfCycles: numberOfCyclesFromMenu,
    monAverageFoodPrice: monAverageFoodPriceFromMenu,
    tueAverageFoodPrice: tueAverageFoodPriceFromMenu,
    wedAverageFoodPrice: wedAverageFoodPriceFromMenu,
    thuAverageFoodPrice: thuAverageFoodPriceFromMenu,
    friAverageFoodPrice: friAverageFoodPriceFromMenu,
    satAverageFoodPrice: satAverageFoodPriceFromMenu,
    sunAverageFoodPrice: sunAverageFoodPriceFromMenu,
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

  const endDate =
    isCycleMenu &&
    addWeeksToDate(new Date(startDate), numberOfCycles).getTime();

  switch (tab) {
    case MENU_INFORMATION_TAB: {
      return {
        title,
        publicData: {
          daysOfWeek,
          mealType,
          startDate,
          ...(endDate ? { endDate } : {}),
          ...(isCycleMenu ? { numberOfCycles } : {}),
          foodsByDate: createFoodByDateByDaysOfWeekField(
            foodsByDateFromMenu,
            daysOfWeek,
          ),
          ...createFoodAveragePriceByDaysOfWeekField(
            {
              monAverageFoodPrice: monAverageFoodPriceFromMenu,
              tueAverageFoodPrice: tueAverageFoodPriceFromMenu,
              wedAverageFoodPrice: wedAverageFoodPriceFromMenu,
              thuAverageFoodPrice: thuAverageFoodPriceFromMenu,
              friAverageFoodPrice: friAverageFoodPriceFromMenu,
              satAverageFoodPrice: satAverageFoodPriceFromMenu,
              sunAverageFoodPrice: sunAverageFoodPriceFromMenu,
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
          ...createAvaragePriceByFoodsByDate(foodsByDate),
          foodsByDate: createSubmitFoodsByDate(foodsByDate),
          daysOfWeek: daysOfWeekFromMenu,
          mealType: mealTyperFromMenu,
          startDate: startDateFromMenu,
          ...(endDateFromMenu ? { endDateFromMenu } : {}),
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
          monAverageFoodPrice: monAverageFoodPriceFromMenu,
          tueAverageFoodPrice: tueAverageFoodPriceFromMenu,
          wedAverageFoodPrice: wedAverageFoodPriceFromMenu,
          thuAverageFoodPrice: thuAverageFoodPriceFromMenu,
          friAverageFoodPrice: friAverageFoodPriceFromMenu,
          satAverageFoodPrice: satAverageFoodPriceFromMenu,
          sunAverageFoodPrice: sunAverageFoodPriceFromMenu,
          daysOfWeek: daysOfWeekFromMenu,
          mealType: mealTyperFromMenu,
          startDate: startDateFromMenu,
          foodsByDate: foodsByDateFromMenu,
          ...(endDateFromMenu ? { endDateFromMenu } : {}),
          ...(menuTypeFromMenu === EMenuTypes.cycleMenu
            ? { numberOfCycles: numberOfCyclesFromMenu }
            : {}),
        },
        metadata: {
          monFoodIdList: monFoodIdListFromMenu,
          tueFoodIdList: tueFoodIdListFromMenu,
          wedFoodIdList: wedFoodIdListFromMenu,
          thuFoodIdList: thuFoodIdListFromMenu,
          friFoodIdList: friFoodIdListFromMenu,
          satFoodIdList: satFoodIdListFromMenu,
          sunFoodIdList: sunFoodIdListFromMenu,
          /// /
          monNutritions: monNutritionsFromMenu,
          tueNutritions: tueNutritionsFromMenu,
          wedNutritions: wedNutritionsFromMenu,
          thuNutritions: thuNutritionsFromMenu,
          friNutritions: friNutritionsFromMenu,
          satNutritions: satNutritionsFromMenu,
          sunNutritions: sunNutritionsFromMenu,
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
    daysOfWeek,
    id,
    numberOfCycles,
    monAverageFoodPrice = 0,
    tueAverageFoodPrice = 0,
    wedAverageFoodPrice = 0,
    thuAverageFoodPrice = 0,
    friAverageFoodPrice = 0,
    satAverageFoodPrice = 0,
    sunAverageFoodPrice = 0,
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
  const endDate =
    isCycleMenu &&
    addWeeksToDate(new Date(startDate), numberOfCycles).getTime();
  return {
    id,
    publicData: {
      startDate,
      daysOfWeek,
      mealType,
      ...(endDate ? { endDate } : {}),
      ...(isCycleMenu ? { numberOfCycles } : {}),
      foodsByDate: createFoodByDateByDaysOfWeekField(foodsByDate, daysOfWeek),
      ...createFoodAveragePriceByDaysOfWeekField(
        {
          monAverageFoodPrice,
          tueAverageFoodPrice,
          wedAverageFoodPrice,
          thuAverageFoodPrice,
          friAverageFoodPrice,
          satAverageFoodPrice,
          sunAverageFoodPrice,
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
  menuPickedFoods: TIntegrationListing[] = [],
) => {
  let initialValue = {};
  const startDayOfWeek = getStartOfWeek();
  Object.keys(foodsByDate).forEach((dayOfWeeks) => {
    const dayOfWeekAsNumber = getDayOfWeekAsIndex(dayOfWeeks as EDayOfWeek);
    const daysOfCurrentWeek = addDaysToDate(startDayOfWeek, dayOfWeekAsNumber);
    const foodByDate = foodsByDate[dayOfWeeks];
    let newFoodByDate = {};
    Object.keys(foodByDate).forEach((idAsKey) => {
      const food = foodByDate[idAsKey];
      const { sideDishes = [], id, foodNote } = food;
      const foodFromDuck = menuPickedFoods.find((m) => m.id.uuid === id);
      const title = foodFromDuck?.attributes.title;
      const price = foodFromDuck?.attributes.price?.amount || 0;

      newFoodByDate = {
        ...newFoodByDate,
        [idAsKey]: {
          title,
          id,
          sideDishes,
          price,
          foodNote,
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
