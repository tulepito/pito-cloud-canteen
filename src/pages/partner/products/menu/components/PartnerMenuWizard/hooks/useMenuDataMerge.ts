import { useMemo } from 'react';

import { useAppSelector } from '@hooks/reduxHooks';
import useQueryMenuPickedFoods from '@pages/admin/partner/[restaurantId]/settings/menu/components/EditPartnerMenuWizard/useQueryMenuPickedFoods';
import { renderValuesForFoodsByDate } from '@pages/admin/partner/[restaurantId]/settings/menu/components/EditPartnerMenuWizard/utils';
import { IntegrationMenuListing } from '@src/utils/data';
import { findClassDays } from '@utils/dates';
import type { TIntegrationListing } from '@utils/types';

import {
  type TMenuSnapshot,
  buildMenuSnapshot,
  createSyntheticMenu,
} from '../utils';

type TUseMenuDataMergeProps = {
  currentMenu: TIntegrationListing | null;
  menuId?: string;
  restaurantId: string;
};

type TUseMenuDataMergeReturn = {
  snapshot: TMenuSnapshot;
  syntheticMenu: TIntegrationListing;
  menuPickedFoods: TIntegrationListing[];
  listDates: number[];
  minDate: number;
  anchorDate: Date;
  foodByDateToRender: any;
};

/**
 * Custom hook to merge menu data from different sources
 * Handles the complex logic of combining currentMenu and draftMenu
 */
export const useMenuDataMerge = ({
  currentMenu,
  menuId,
  restaurantId,
}: TUseMenuDataMergeProps): TUseMenuDataMergeReturn => {
  const draftMenu = useAppSelector(
    (state) => state.PartnerManageMenus.draftMenu,
  );

  // Build snapshot from current menu or draft menu
  const snapshot = useMemo(
    () => buildMenuSnapshot(currentMenu, draftMenu),
    [currentMenu, draftMenu],
  );

  // Create synthetic menu for form rendering
  const syntheticMenu = useMemo(
    () => createSyntheticMenu(snapshot, menuId, restaurantId, currentMenu),
    [snapshot, menuId, restaurantId, currentMenu],
  );

  // Get menu listing helper
  const currentMenuListing = useMemo(
    () => IntegrationMenuListing(syntheticMenu),
    [syntheticMenu],
  );

  // Get food IDs to query
  const idsToQuery = currentMenuListing.getListFoodIds();

  // Query picked foods
  const { menuPickedFoods } = useQueryMenuPickedFoods({
    restaurantId: restaurantId as string,
    ids: idsToQuery,
  });

  // Calculate list of dates based on start/end date and days of week
  // findClassDays returns timestamps (number[])
  const listDates = useMemo(
    () =>
      snapshot.startDate && snapshot.endDate
        ? findClassDays(
            snapshot.daysOfWeek,
            new Date(snapshot.startDate),
            new Date(snapshot.endDate),
          )
        : [],
    [snapshot.daysOfWeek, snapshot.startDate, snapshot.endDate],
  );

  // Find minimum date (listDates contains timestamps)
  const minDate = useMemo(
    () =>
      listDates.length > 0
        ? listDates.reduce((prev, curDate) => {
            return prev < curDate && prev >= Date.now() ? prev : curDate;
          }, listDates[0])
        : Date.now(),
    [listDates],
  );

  // Anchor date for calendar
  const anchorDate = useMemo(() => new Date(minDate), [minDate]);

  // Render foods by date for form
  const foodByDateToRender = useMemo(
    () =>
      renderValuesForFoodsByDate(
        snapshot.foodsByDate,
        anchorDate,
        menuPickedFoods,
      ),
    [snapshot.foodsByDate, anchorDate, menuPickedFoods],
  );

  return {
    snapshot,
    syntheticMenu,
    menuPickedFoods,
    listDates,
    minDate,
    anchorDate,
    foodByDateToRender,
  };
};
