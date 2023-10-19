import {
  createFoodAveragePriceByDaysOfWeekField,
  createFoodByDateByDaysOfWeekField,
  createFoodListIdByDaysOfWeekField,
  createListFoodIdsByFoodsByDate,
  createListFoodTypeByFoodIds,
  createMinPriceByDayOfWeek,
  createNutritionsByDaysOfWeekField,
} from '@pages/api/apiUtils/menu';
import { denormalisedResponseEntities } from '@services/data';
import { getIntegrationSdk } from '@services/sdk';
import { IntegrationListing } from '@src/utils/data';
import { addWeeksToDate } from '@src/utils/dates';
import { EMenuType } from '@src/utils/enums';
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
    startDate,
    daysOfWeek,
    restaurantId,
    foodsByDate,
    title,
    endDate,
    numberOfCycles,
  } = dataParams;

  const integrationSdk = getIntegrationSdk();

  const isCycleMenu = menuType === EMenuType.cycleMenu;
  const menuResponse = await integrationSdk.listings.show({
    id: menuId,
  });

  const [menu] = denormalisedResponseEntities(menuResponse);

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
    restaurantId && daysOfWeek
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
        ...(startDate ? { startDate } : {}),
        ...(endDateToSubmit ? { endDate: endDateToSubmit } : {}),
        ...(isCycleMenu
          ? { ...(numberOfCycles ? { numberOfCycles } : {}) }
          : {}),
        ...(daysOfWeek
          ? {
              foodsByDate: createFoodByDateByDaysOfWeekField(
                foodsByDateFromMenu,
                daysOfWeek,
              ),
            }
          : {
              ...(foodsByDate ? { foodsByDate } : {}),
            }),
        ...(daysOfWeek
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
