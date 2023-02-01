import { ListingTypes } from '@src/types/listingTypes';
import { addWeeksToDate } from '@utils/dates';
import { EListingStates, EMenuTypes } from '@utils/enums';

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
};

export const createSubmitMenuValues = (
  values: TCreateSubmitCreateMenuValues,
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
          listingState: EListingStates.draft,
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
