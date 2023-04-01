import {
  createFoodAveragePriceByDaysOfWeekField,
  createFoodByDateByDaysOfWeekField,
  createFoodListIdByDaysOfWeekField,
  createListFoodIdsByFoodsByDate,
  createListFoodNutritionByFoodsByDate,
  createMinPriceByDayOfWeek,
  createNutritionsByDaysOfWeekField,
  createSubmitFoodsByDate,
} from '@pages/api/apiUtils/menu';
import { denormalisedResponseEntities } from '@services/data';
import { getIntegrationSdk } from '@services/integrationSdk';
import { ListingTypes } from '@src/types/listingTypes';
import { IntegrationListing } from '@src/utils/data';
import { addWeeksToDate } from '@src/utils/dates';
import { EListingStates, EMenuTypes } from '@src/utils/enums';
import type { TDuplicateMenuApiParams, TObject } from '@src/utils/types';

const duplicateMenu = async (
  menuId: string,
  dataParams: TDuplicateMenuApiParams,
  queryParams: TObject = {},
) => {
  const integrationSdk = getIntegrationSdk();

  const {
    menuType,
    mealType,
    startDate,
    daysOfWeek,
    foodsByDate,
    title,
    numberOfCycles,
    endDate,
  } = dataParams;
  const isCycleMenu = menuType === EMenuTypes.cycleMenu;

  const response = await integrationSdk.listings.show({
    id: menuId,
    include: ['author'],
  });

  const [menu] = denormalisedResponseEntities(response);

  const { title: titleFromMenu } = IntegrationListing(menu).getAttributes();

  const {
    mealType: mealTyperFromMenu,
    startDate: startDateFromMenu,
    endDate: endDateFromMenu,
    numberOfCycles: numberOfCyclesFromMenu,
    monMinFoodPrice: monMinFoodPriceFromMenu,
    tueMinFoodPrice: tueMinFoodPriceFromMenu,
    wedMinFoodPrice: wedMinFoodPriceFromMenu,
    thuMinFoodPrice: thuMinFoodPriceFromMenu,
    friMinFoodPrice: friMinFoodPriceFromMenu,
    satMinFoodPrice: satMinFoodPriceFromMenu,
    sunMinFoodPrice: sunMinFoodPriceFromMenu,
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
    restaurantId,
  } = IntegrationListing(menu).getMetadata();

  const { menuType: menuTypeFromMenu } = IntegrationListing(menu).getMetadata();

  const endDateFromMenuToSubmit =
    menuTypeFromMenu === EMenuTypes.cycleMenu
      ? addWeeksToDate(
          new Date(startDateFromMenu),
          numberOfCyclesFromMenu,
        ).getTime()
      : endDateFromMenu;

  const endDateToSubmit = isCycleMenu
    ? addWeeksToDate(new Date(startDate), numberOfCycles).getTime()
    : endDate;

  const createParams = {
    ...(title ? { title } : { title: titleFromMenu }),
    publicData: {
      ...(daysOfWeek ? { daysOfWeek } : { daysOfWeek: daysOfWeekFromMenu }),
      ...(mealType ? { mealType } : { mealType: mealTyperFromMenu }),
      ...(startDate ? { startDate } : { startDate: startDateFromMenu }),
      ...(endDateToSubmit
        ? { endDate: endDateToSubmit }
        : { endDate: endDateFromMenuToSubmit }),
      ...(isCycleMenu
        ? {
            ...(numberOfCycles
              ? { numberOfCycles }
              : { numberOfCycles: numberOfCyclesFromMenu }),
          }
        : {}),
      ...(daysOfWeek
        ? {
            foodsByDate: createFoodByDateByDaysOfWeekField(
              foodsByDateFromMenu,
              daysOfWeek,
            ),
          }
        : {}),
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
      ...(foodsByDate
        ? {
            ...createMinPriceByDayOfWeek(foodsByDate),
          }
        : {}),
      ...(foodsByDate
        ? {
            foodsByDate: createSubmitFoodsByDate(foodsByDate),
          }
        : {}),
    },
    metadata: {
      ...(daysOfWeek
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
          }
        : {}),
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
      ...(foodsByDate
        ? { ...createListFoodIdsByFoodsByDate(foodsByDate) }
        : {}),
      ...(foodsByDate
        ? { ...createListFoodNutritionByFoodsByDate(foodsByDate) }
        : {}),
      ...(menuType ? { menuType } : { menuType: menuTypeFromMenu }),
      listingType: ListingTypes.MENU,
      restaurantId,
      listingState: IntegrationListing(menu).getMetadata().listingState,
    },
    authorId: menu.author.id.uuid,
    state: EListingStates.published,
  };
  console.log({ createParams });
  const menuResponse = await integrationSdk.listings.create(
    createParams,
    queryParams,
  );

  return menuResponse;
};

export default duplicateMenu;
