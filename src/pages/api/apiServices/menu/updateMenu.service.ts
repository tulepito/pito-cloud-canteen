import isEqual from 'lodash/isEqual';

import {
  createFoodAveragePriceByDaysOfWeekField,
  createFoodByDateByDaysOfWeekField,
  createFoodListIdByDaysOfWeekField,
  createListFoodIdsByFoodsByDate,
  createListFoodTypeByFoodIds,
  createMinPriceByDayOfWeek,
  createNutritionsByDaysOfWeekField,
  createPartnerDraftFoodByDateByDaysOfWeekField,
} from '@pages/api/apiUtils/menu';
import { denormalisedResponseEntities } from '@services/data';
import { getIntegrationSdk } from '@services/sdk';
import { IntegrationListing } from '@src/utils/data';
import { addWeeksToDate } from '@src/utils/dates';
import { EMenuTypes } from '@src/utils/enums';
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

  const isCycleMenu = menuType === EMenuTypes.cycleMenu;
  const menuResponse = await integrationSdk.listings.show(
    {
      id: menuId,
    },
    { expand: true },
  );

  const [menu] = denormalisedResponseEntities(menuResponse);
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
  const response = await integrationSdk.listings.update(
    {
      id: menuId,
      ...(title ? { title } : {}),
      publicData: {
        ...(daysOfWeek ? { daysOfWeek } : {}),
        ...(menuType ? { menuType } : {}),
        ...(mealType ? { mealType } : {}),
        ...(mealTypes && isDraftEditFlow
          ? { mealTypes }
          : { mealTypes: undefined }),
        ...(startDate ? { startDate } : {}),
        ...(endDateToSubmit ? { endDate: endDateToSubmit } : {}),
        ...(isCycleMenu
          ? { ...(numberOfCycles ? { numberOfCycles } : {}) }
          : {}),
        ...(daysOfWeek &&
        (isDaysOfWeekChanged || isMealTypesChanged) &&
        isDraftEditFlow
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
          : { draftFoodByDate: undefined }),
        ...(daysOfWeek && isDaysOfWeekChanged
          ? {
              foodsByDate: createFoodByDateByDaysOfWeekField(
                foodsByDate || foodsByDateFromMenu,
                daysOfWeek,
              ),
            }
          : {
              ...(foodsByDate ? { foodsByDate } : {}),
            }),
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
        ...(restaurantId
          ? {
              ...(daysOfWeek
                ? {
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
            }
          : {}),
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
