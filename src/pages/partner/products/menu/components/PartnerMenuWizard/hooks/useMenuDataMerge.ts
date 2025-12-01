import { useMemo } from 'react';

import { useAppSelector } from '@hooks/reduxHooks';
import useQueryMenuPickedFoods from '@pages/admin/partner/[restaurantId]/settings/menu/components/EditPartnerMenuWizard/useQueryMenuPickedFoods';
import { renderValuesForFoodsByDate } from '@pages/admin/partner/[restaurantId]/settings/menu/components/EditPartnerMenuWizard/utils';
import { IntegrationMenuListing } from '@src/utils/data';
import { findClassDays } from '@utils/dates';
import type { TIntegrationListing } from '@utils/types';

import {
  type TDraftMenu,
  type TFoodByDateToRender,
  createSyntheticMenu,
} from '../utils';

type TUseMenuDataMergeProps = {
  currentMenu: TIntegrationListing | null;
  menuId?: string;
  restaurantId: string;
};

type TUseMenuDataMergeReturn = {
  draftMenu: TDraftMenu | null;
  syntheticMenu: TIntegrationListing;
  menuPickedFoods: TIntegrationListing[];
  listDates: number[];
  minDate: number;
  anchorDate: Date;
  foodByDateToRender: TFoodByDateToRender;
};

/**
 * Custom hook to merge menu data from different sources
 * Uses draftMenu directly instead of snapshot
 */
export const useMenuDataMerge = ({
  currentMenu,
  menuId,
  restaurantId,
}: TUseMenuDataMergeProps): TUseMenuDataMergeReturn => {
  const draftMenu = useAppSelector(
    (state) => state.PartnerManageMenus.draftMenu,
  );

  // Create synthetic menu for form rendering
  const syntheticMenu = useMemo(
    () => createSyntheticMenu(draftMenu, menuId, restaurantId, currentMenu),
    [draftMenu, menuId, restaurantId, currentMenu],
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
  const startDate = draftMenu?.startDate;
  const endDate = draftMenu?.endDate;

  const listDates = useMemo(() => {
    const daysOfWeek = draftMenu?.daysOfWeek || [];

    return startDate && endDate
      ? findClassDays(daysOfWeek, new Date(startDate), new Date(endDate))
      : [];
  }, [draftMenu?.daysOfWeek, startDate, endDate]);

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
  const foodByDateToRender = useMemo(() => {
    const foodsByDate = draftMenu?.foodsByDate || {};

    return renderValuesForFoodsByDate(foodsByDate, anchorDate, menuPickedFoods);
  }, [draftMenu?.foodsByDate, anchorDate, menuPickedFoods]);

  return {
    draftMenu,
    syntheticMenu,
    menuPickedFoods,
    listDates,
    minDate,
    anchorDate,
    foodByDateToRender,
  };
};
