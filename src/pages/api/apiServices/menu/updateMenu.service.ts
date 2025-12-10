import isEqual from 'lodash/isEqual';
import uniq from 'lodash/uniq';

import {
  createFoodAveragePriceByDaysOfWeekField,
  createFoodByDateByDaysOfWeekField,
  createFoodListIdByDaysOfWeekField,
  createListFoodIdsByFoodsByDate,
  createListFoodNutritionByFoodsByDate,
  createListFoodTypeByFoodIds,
  createMinPriceByDayOfWeek,
  createPartnerDraftFoodByDateByDaysOfWeekField,
} from '@pages/api/apiUtils/menu';
import { denormalisedResponseEntities } from '@services/data';
import { getIntegrationSdk } from '@services/sdk';
import { IntegrationListing } from '@src/utils/data';
import { addWeeksToDate } from '@src/utils/dates';
import { EMenuStatus, EMenuType } from '@src/utils/enums';
import type { TObject, TUpdateMenuApiParams } from '@src/utils/types';

import updateMenuIdListAndMenuWeekDayListForFood from './updateMenuIdListAndMenuWeekDayListForFood.service';

const updateMenu = async (
  menuId: string,
  dataParams: TUpdateMenuApiParams,
  queryParams: TObject = {},
) => {
  const {
    menuType,
    mealType,
    mealTypes,
    startDate,
    daysOfWeek,
    restaurantId,
    draftFoodByDate,
    foodsByDate,
    title,
    endDate,
    numberOfCycles,
    isDraftEditFlow = false,
  } = dataParams;

  const integrationSdk = getIntegrationSdk();

  const isCycleMenu = menuType === EMenuType.cycleMenu;
  const menuResponse = await integrationSdk.listings.show({
    id: menuId,
  });

  const [menu] = denormalisedResponseEntities(menuResponse);
  if (menu.metadata?.menuStatus === EMenuStatus.approved) {
    throw new Error('Menu đã được duyệt. Không thể cập nhật');
  }
  const {
    mealTypes: mealTypesFromMenu = [],
    daysOfWeek: daysOfWeekFromMenu = [],
    foodsByDate: foodsByDateFromMenu = {},
    monMinFoodPrice: monMinFoodPriceFromMenu = 0,
    tueMinFoodPrice: tueMinFoodPriceFromMenu = 0,
    wedMinFoodPrice: wedMinFoodPriceFromMenu = 0,
    thuMinFoodPrice: thuMinFoodPriceFromMenu = 0,
    friMinFoodPrice: friMinFoodPriceFromMenu = 0,
    satMinFoodPrice: satMinFoodPriceFromMenu = 0,
    sunMinFoodPrice: sunMinFoodPriceFromMenu = 0,
    draftFoodByDate: currentDraftFoodByDate,
  } = IntegrationListing(menu).getPublicData();

  const isDaysOfWeekChanged = !isEqual(daysOfWeekFromMenu, daysOfWeek);
  const isMealTypesChanged = !isEqual(mealTypesFromMenu, mealTypes || []);

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

  const endDateToSubmit = isCycleMenu
    ? addWeeksToDate(new Date(startDate), numberOfCycles).getTime()
    : endDate;

  const listFoodIdsByDate =
    restaurantId && daysOfWeek && isDaysOfWeekChanged
      ? createFoodListIdByDaysOfWeekField(
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
        )
      : foodsByDate
      ? createListFoodIdsByFoodsByDate(foodsByDate)
      : {};
  const foodTypesByDayOfWeek = await createListFoodTypeByFoodIds(
    listFoodIdsByDate,
  );
  // * prepare mealTypes value
  const mealTypesMaybe = isDraftEditFlow
    ? mealTypes
      ? { mealTypes }
      : {}
    : { mealTypes: undefined };
  // * prepare draftFoodByDate value
  const draftFoodByDateMaybe = isDraftEditFlow
    ? daysOfWeek && (isDaysOfWeekChanged || isMealTypesChanged)
      ? {
          draftFoodByDate:
            typeof draftFoodByDate === 'undefined'
              ? createPartnerDraftFoodByDateByDaysOfWeekField(
                  daysOfWeek,
                  mealTypes,
                  currentDraftFoodByDate || {},
                )
              : draftFoodByDate,
        }
      : {}
    : { draftFoodByDate: undefined };

  // * prepare foodsByDate value
  const foodsByDateMaybe =
    daysOfWeek && isDaysOfWeekChanged
      ? {
          foodsByDate: createFoodByDateByDaysOfWeekField(
            foodsByDate || foodsByDateFromMenu,
            daysOfWeek,
          ),
        }
      : {
          ...(foodsByDate ? { foodsByDate } : {}),
        };

  const {
    monNutritions: monNutritionsMaybe = [],
    tueNutritions: tueNutritionsMaybe = [],
    wedNutritions: wedNutritionsMaybe = [],
    thuNutritions: thuNutritionsMaybe = [],
    friNutritions: friNutritionsMaybe = [],
    satNutritions: satNutritionsMaybe = [],
    sunNutritions: sunNutritionsMaybe = [],
  } = (createListFoodNutritionByFoodsByDate(foodsByDate || {}) ||
    {}) as TObject;

  const response = await integrationSdk.listings.update(
    {
      id: menuId,
      ...(title ? { title } : {}),
      publicData: {
        ...(daysOfWeek ? { daysOfWeek } : {}),
        ...(menuType ? { menuType } : {}),
        ...(mealType ? { mealType } : {}),
        ...mealTypesMaybe,
        ...(startDate ? { startDate } : {}),
        ...(endDateToSubmit ? { endDate: endDateToSubmit } : {}),
        ...(isCycleMenu
          ? { ...(numberOfCycles ? { numberOfCycles } : {}) }
          : {}),
        ...draftFoodByDateMaybe,
        ...foodsByDateMaybe,
        ...(daysOfWeek && isDaysOfWeekChanged
          ? {
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
        ...(foodsByDate ? { ...createMinPriceByDayOfWeek(foodsByDate) } : {}),
      },
      metadata: {
        ...(menuType ? { menuType } : {}),
        ...(restaurantId ? { restaurantId } : {}),
        monNutritions: uniq([...monNutritionsFromMenu, ...monNutritionsMaybe]),
        tueNutritions: uniq([...tueNutritionsFromMenu, ...tueNutritionsMaybe]),
        wedNutritions: uniq([...wedNutritionsFromMenu, ...wedNutritionsMaybe]),
        thuNutritions: uniq([...thuNutritionsFromMenu, ...thuNutritionsMaybe]),
        friNutritions: uniq([...friNutritionsFromMenu, ...friNutritionsMaybe]),
        satNutritions: uniq([...satNutritionsFromMenu, ...satNutritionsMaybe]),
        sunNutritions: uniq([...sunNutritionsFromMenu, ...sunNutritionsMaybe]),
        ...listFoodIdsByDate,
        ...foodTypesByDayOfWeek,
      },
    },
    queryParams,
  );

  const [newMenu] = denormalisedResponseEntities(response);
  await updateMenuIdListAndMenuWeekDayListForFood(newMenu);

  return response;
};

export default updateMenu;
