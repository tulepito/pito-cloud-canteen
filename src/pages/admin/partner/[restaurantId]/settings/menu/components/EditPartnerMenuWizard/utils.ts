import { ListingTypes } from '@src/types/listingTypes';
import { INTERGRATION_LISTING } from '@utils/data';
import { addWeeksToDate } from '@utils/dates';
import { EListingStates, EMenuTypes } from '@utils/enums';
import type { TIntergrationListing } from '@utils/types';

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
  mealTypes: string[];
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
};

export const createSubmitMenuValues = (
  values: TCreateSubmitCreateMenuValues,
  tab: string,
  menu?: TIntergrationListing | null,
) => {
  const {
    menuType,
    mealTypes,
    startDate,
    daysOfWeek,
    restaurantId,
    foodsByDate,
    title,
    numberOfCycles,
  } = values;
  const isCycleMenu = menuType === EMenuTypes.cycleMenu;
  const { listingState } = INTERGRATION_LISTING(menu).getMetadata();
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
          mealTypes,
          startDate,
          ...(endDate ? { endDate } : {}),
          ...(isCycleMenu ? { numberOfCycles } : {}),
        },
        metadata: {
          menuType,
          listingType: ListingTypes.MENU,
          restaurantId,
          ...(!alreadyPublished ? { listingState: EListingStates.draft } : {}),
        },
      };
    }
    case MENU_PRICING_TAB: {
      return {
        publicData: {
          foodsByDate,
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
  menu: TIntergrationListing,
  tab: string,
) => {
  const {
    menuType,
    mealTypes,
    startDate,
    daysOfWeek,
    restaurantId,
    foodsByDate,
    title,
    numberOfCycles,
  } = values;
  const isCycleMenu = menuType === EMenuTypes.cycleMenu;

  const { title: titleFromMenu } = INTERGRATION_LISTING(menu).getAttributes();

  const {
    mealTypes: mealTypesFromMenu,
    startDate: startDateFromMenu,
    numberOfCycles: numberOfCyclesFromMenu,
    foodsByDate: foodsByDateFromMenu,
    daysOfWeek: daysOfWeekFromMenu,
  } = INTERGRATION_LISTING(menu).getPublicData();

  const { menuType: menuTypeFromMenu } =
    INTERGRATION_LISTING(menu).getMetadata();

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
          mealTypes,
          startDate,
          ...(endDate ? { endDate } : {}),
          ...(isCycleMenu ? { numberOfCycles } : {}),
          foodsByDate: foodsByDateFromMenu,
        },
        metadata: {
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
          foodsByDate,
          daysOfWeek: daysOfWeekFromMenu,
          mealTypes: mealTypesFromMenu,
          startDate: startDateFromMenu,
          ...(endDateFromMenu ? { endDateFromMenu } : {}),
          ...(menuTypeFromMenu === EMenuTypes.cycleMenu
            ? { numberOfCycles: numberOfCyclesFromMenu }
            : {}),
        },
        metadata: {
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
          foodsByDate: foodsByDateFromMenu,
          daysOfWeek: daysOfWeekFromMenu,
          mealTypes: mealTypesFromMenu,
          startDate: startDateFromMenu,
          ...(endDateFromMenu ? { endDateFromMenu } : {}),
          ...(menuTypeFromMenu === EMenuTypes.cycleMenu
            ? { numberOfCycles: numberOfCyclesFromMenu }
            : {}),
        },
        metadata: {
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
  const { menuType, startDate, daysOfWeek, id, numberOfCycles } = values;
  const isCycleMenu = menuType === EMenuTypes.cycleMenu;
  const endDate =
    isCycleMenu &&
    addWeeksToDate(new Date(startDate), numberOfCycles).getTime();
  return {
    id,
    publicData: {
      startDate,
      daysOfWeek,
      ...(endDate ? { endDate } : {}),
      ...(isCycleMenu ? { numberOfCycles } : {}),
    },
  };
};
