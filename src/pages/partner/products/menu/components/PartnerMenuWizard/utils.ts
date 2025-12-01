import { IntegrationMenuListing } from '@src/utils/data';
import { EMenuMealType, EMenuType } from '@utils/enums';
import type { TIntegrationListing, TObject } from '@utils/types';

/**
 * Food item in foodsByDate structure
 */
export type TFoodByDateItem = {
  id: string;
  dayOfWeek?: string;
  sideDishes?: string[];
  foodNote?: string;
  price?: number;
  title?: string;
  nutritionsList?: string[];
  [key: string]: unknown;
};

/**
 * Foods by date structure: key is dayOfWeek (e.g., "Mon", "Tue"), value is object with foodId as key
 */
export type TFoodsByDate = Record<string, Record<string, TFoodByDateItem>>;

/**
 * Draft menu structure
 */
export type TDraftMenu = {
  menuName?: string;
  menuType?: EMenuType;
  mealType?: EMenuMealType;
  mealTypes?: EMenuMealType[];
  startDate?: number;
  endDate?: number;
  daysOfWeek?: string[];
  numberOfCycles?: number;
  foodsByDate?: TFoodsByDate;
  foodByDate?: TFoodsByDate;
  draftFoodByDate?: Partial<Record<EMenuMealType, TFoodsByDate>>;
};

/**
 * Food by date to render structure: key is timestamp (string), value is object with foodId as key
 */
export type TFoodByDateToRender = Record<
  string,
  Record<string, TFoodByDateItem>
>;

/**
 * Convert value to timestamp
 */
export const toTimestamp = (
  value?: number | Date,
  fallback?: number,
): number => {
  if (value instanceof Date) {
    return value.getTime();
  }
  if (typeof value === 'number') {
    return value;
  }

  return fallback ?? Date.now();
};

/**
 * Check if object has entries
 */
export const hasEntries = (obj?: TObject): boolean =>
  !!obj && Object.keys(obj).length > 0;

/**
 * Convert currentMenu to draftMenu format
 * Used to initialize draftMenu when loading an existing menu
 */
export const convertCurrentMenuToDraftMenu = (
  currentMenu: TIntegrationListing | null | undefined,
): TDraftMenu | null => {
  if (!currentMenu) {
    return null;
  }

  const listing = IntegrationMenuListing(currentMenu);
  const attributes = listing.getAttributes();
  const metadata = listing.getMetadata();
  const publicData = listing.getPublicData();

  const mealType = publicData?.mealType || EMenuMealType.lunch;

  return {
    menuName: attributes?.title || '',
    menuType: metadata?.menuType || EMenuType.fixedMenu,
    mealType,
    mealTypes: publicData?.mealTypes || [mealType],
    startDate: publicData?.startDate || Date.now(),
    endDate: publicData?.endDate || Date.now(),
    daysOfWeek: publicData?.daysOfWeek || [],
    numberOfCycles: publicData?.numberOfCycles || 1,
    foodsByDate: publicData?.foodsByDate || {},
    foodByDate: publicData?.foodsByDate || {},
    draftFoodByDate: publicData?.draftFoodByDate || {},
  };
};

/**
 * Build draft menu payload from submit values and draft menu
 * Note: draftMenu should be initialized from currentMenu when loading an existing menu
 */
export const buildDraftMenuPayload = ({
  submitValues,
  draftMenu,
}: {
  submitValues: TObject;
  draftMenu: TDraftMenu | null;
}): TDraftMenu => {
  const mealType =
    submitValues.mealType || draftMenu?.mealType || EMenuMealType.lunch;

  const mealTypes = [mealType];

  const daysOfWeek = submitValues.daysOfWeek?.length
    ? submitValues.daysOfWeek
    : draftMenu?.daysOfWeek || [];

  const foodsByDatePayload =
    hasEntries(submitValues.foodsByDate) && submitValues.foodsByDate
      ? submitValues.foodsByDate
      : null;

  const baseDraftFoodByDate = draftMenu?.draftFoodByDate || {};

  const nextDraftFoodByDate: Partial<Record<EMenuMealType, TFoodsByDate>> =
    foodsByDatePayload
      ? {
          ...baseDraftFoodByDate,
          [mealType]: foodsByDatePayload as TFoodsByDate,
        }
      : baseDraftFoodByDate;

  const baseFoodByDate =
    draftMenu?.foodByDate ||
    (baseDraftFoodByDate?.[mealType as EMenuMealType] as
      | TFoodsByDate
      | undefined) ||
    {};

  const foodByDate = foodsByDatePayload || baseFoodByDate;

  const foodsByDate = foodsByDatePayload || draftMenu?.foodsByDate || {};

  const menuType =
    submitValues.menuType || draftMenu?.menuType || EMenuType.fixedMenu;

  const numberOfCycles =
    menuType === EMenuType.cycleMenu
      ? submitValues.numberOfCycles || draftMenu?.numberOfCycles || 1
      : undefined;

  return {
    menuName: submitValues.title || draftMenu?.menuName || '',
    startDate: toTimestamp(submitValues.startDate, draftMenu?.startDate),
    endDate: toTimestamp(submitValues.endDate, draftMenu?.endDate),
    menuType,
    mealType,
    ...(numberOfCycles ? { numberOfCycles: Number(numberOfCycles) } : {}),
    mealTypes,
    daysOfWeek,
    foodByDate,
    foodsByDate,
    draftFoodByDate: nextDraftFoodByDate,
  };
};

/**
 * Create synthetic menu for form rendering when menu doesn't exist yet
 */
export const createSyntheticMenu = (
  draftMenu: TDraftMenu | null,
  menuId: string | undefined,
  restaurantId: string,
  currentMenu: TIntegrationListing | null,
): TIntegrationListing => {
  if (currentMenu) {
    return currentMenu;
  }

  const mealType = draftMenu?.mealType || EMenuMealType.lunch;

  return {
    id: { uuid: menuId || 'partner-menu-draft' },
    type: 'listing',
    attributes: {
      title: draftMenu?.menuName || '',
      metadata: {
        listingState: 'draft',
        menuType: draftMenu?.menuType || EMenuType.fixedMenu,
        mealType,
        restaurantId,
      },
      publicData: {
        menuType: draftMenu?.menuType || EMenuType.fixedMenu,
        mealType,
        mealTypes: draftMenu?.mealTypes || [mealType],
        foodsByDate: draftMenu?.foodsByDate || {},
        draftFoodByDate: draftMenu?.draftFoodByDate || {},
        daysOfWeek: draftMenu?.daysOfWeek || [],
        startDate: draftMenu?.startDate || Date.now(),
        endDate: draftMenu?.endDate || Date.now(),
        numberOfCycles: draftMenu?.numberOfCycles || 1,
      },
    },
  } as unknown as TIntegrationListing;
};
