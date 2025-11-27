import { IntegrationMenuListing } from '@src/utils/data';
import { EMenuMealType, EMenuType } from '@utils/enums';
import type { TIntegrationListing, TObject } from '@utils/types';

export type TMenuSnapshot = {
  id: string | null;
  title: string;
  menuType: EMenuType;
  mealType: EMenuMealType;
  mealTypes: EMenuMealType[];
  startDate: number;
  endDate: number;
  daysOfWeek: string[];
  numberOfCycles: number;
  foodsByDate: TObject;
  draftFoodByDate: TObject;
};

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
 * Build menu snapshot from current menu or draft menu
 */
export const buildMenuSnapshot = (
  currentMenu: TIntegrationListing | null | undefined,
  draftMenu: TObject | null,
): TMenuSnapshot => {
  if (currentMenu) {
    const listing = IntegrationMenuListing(currentMenu);
    const attributes = listing.getAttributes();
    const metadata = listing.getMetadata();
    const publicData = listing.getPublicData();

    return {
      id: currentMenu?.id?.uuid || null,
      title: attributes?.title || '',
      menuType: metadata?.menuType || EMenuType.fixedMenu,
      mealType: publicData?.mealType || EMenuMealType.lunch,
      mealTypes: publicData?.mealTypes || [
        publicData?.mealType || EMenuMealType.lunch,
      ],
      startDate: publicData?.startDate || Date.now(),
      endDate: publicData?.endDate || Date.now(),
      daysOfWeek: publicData?.daysOfWeek || [],
      numberOfCycles: publicData?.numberOfCycles || 1,
      foodsByDate: publicData?.foodsByDate || {},
      draftFoodByDate: publicData?.draftFoodByDate || {},
    };
  }

  const draftMealType = draftMenu?.mealType || EMenuMealType.lunch;

  return {
    id: null,
    title: draftMenu?.menuName || '',
    menuType: draftMenu?.menuType || EMenuType.fixedMenu,
    mealType: draftMealType,
    mealTypes: draftMenu?.mealTypes || [draftMealType],
    startDate: draftMenu?.startDate || Date.now(),
    endDate: draftMenu?.endDate || Date.now(),
    daysOfWeek: draftMenu?.daysOfWeek || [],
    numberOfCycles: draftMenu?.numberOfCycles || 1,
    foodsByDate: draftMenu?.foodsByDate || draftMenu?.foodByDate || {},
    draftFoodByDate: draftMenu?.draftFoodByDate || {},
  };
};

/**
 * Build draft menu payload from submit values, draft menu, and snapshot
 */
export const buildDraftMenuPayload = ({
  submitValues,
  draftMenu,
  snapshot,
}: {
  submitValues: TObject;
  draftMenu: TObject | null;
  snapshot: TMenuSnapshot;
}): TObject => {
  const mealType =
    submitValues.mealType ||
    draftMenu?.mealType ||
    snapshot.mealType ||
    EMenuMealType.lunch;

  const mealTypes = [mealType];

  const daysOfWeek = submitValues.daysOfWeek?.length
    ? submitValues.daysOfWeek
    : draftMenu?.daysOfWeek || snapshot.daysOfWeek || [];

  const foodsByDatePayload =
    hasEntries(submitValues.foodsByDate) && submitValues.foodsByDate
      ? submitValues.foodsByDate
      : null;

  const baseDraftFoodByDate =
    draftMenu?.draftFoodByDate || snapshot.draftFoodByDate || {};

  const nextDraftFoodByDate = foodsByDatePayload
    ? {
        ...baseDraftFoodByDate,
        [mealType]: foodsByDatePayload,
      }
    : baseDraftFoodByDate;

  const baseFoodByDate =
    draftMenu?.foodByDate ||
    baseDraftFoodByDate?.[mealType] ||
    snapshot.foodsByDate ||
    {};

  const foodByDate = foodsByDatePayload || baseFoodByDate;

  const foodsByDate =
    foodsByDatePayload || draftMenu?.foodsByDate || snapshot.foodsByDate || {};

  return {
    menuName: submitValues.title || draftMenu?.menuName || snapshot.title || '',
    startDate: toTimestamp(
      submitValues.startDate,
      draftMenu?.startDate ?? snapshot.startDate,
    ),
    endDate: toTimestamp(
      submitValues.endDate,
      draftMenu?.endDate ?? snapshot.endDate,
    ),
    mealType,
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
  snapshot: TMenuSnapshot,
  menuId: string | undefined,
  restaurantId: string,
  currentMenu: TIntegrationListing | null,
): TIntegrationListing => {
  if (currentMenu) {
    return currentMenu;
  }

  return {
    id: { uuid: snapshot.id || menuId || 'partner-menu-draft' },
    type: 'listing',
    attributes: {
      title: snapshot.title,
      metadata: {
        listingState: 'draft',
        menuType: snapshot.menuType,
        mealType: snapshot.mealType,
        restaurantId,
      },
      publicData: {
        menuType: snapshot.menuType,
        mealType: snapshot.mealType,
        mealTypes: snapshot.mealTypes,
        foodsByDate: snapshot.foodsByDate,
        draftFoodByDate: snapshot.draftFoodByDate,
        daysOfWeek: snapshot.daysOfWeek,
        startDate: snapshot.startDate,
        endDate: snapshot.endDate,
        numberOfCycles: snapshot.numberOfCycles,
      },
    },
  } as unknown as TIntegrationListing;
};
