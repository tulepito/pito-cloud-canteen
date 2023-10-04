import { createPartnerDraftFoodByDateByDaysOfWeekField } from '@pages/api/apiUtils/menu';
import { denormalisedResponseEntities } from '@services/data';
import { getIntegrationSdk } from '@services/integrationSdk';
import { ListingTypes } from '@src/types/listingTypes';
import { addWeeksToDate } from '@src/utils/dates';
import { EListingStates, EMenuTypes } from '@src/utils/enums';
import type {
  TCreateMenuApiParams,
  TIntegrationListing,
  TObject,
} from '@src/utils/types';

import updateMenuIdListAndMenuWeekDayListForFood from './updateMenuIdListAndMenuWeekDayListForFood.service';

const createMenu = async (
  dataParams: TCreateMenuApiParams,
  queryParams: TObject = {},
) => {
  const integrationSdk = getIntegrationSdk();
  const {
    menuType,
    mealType,
    mealTypes,
    startDate,
    daysOfWeek = [],
    restaurantId,
    title,
    numberOfCycles,
    endDate,
  } = dataParams;

  const restaurantRes = await integrationSdk.listings.show({
    id: restaurantId,
    include: ['author'],
  });
  const [restaurant] = denormalisedResponseEntities(restaurantRes);

  const { geolocation } = restaurant.attributes;

  const isCycleMenu = menuType === EMenuTypes.cycleMenu;

  const endDateToSubmit = isCycleMenu
    ? addWeeksToDate(new Date(startDate), numberOfCycles).getTime()
    : endDate;

  const response = await integrationSdk.listings.create(
    {
      title,
      state: EListingStates.published,
      authorId: restaurant?.author?.id?.uuid,
      publicData: {
        daysOfWeek,
        mealType,
        startDate,
        endDate: endDateToSubmit,
        ...(mealTypes ? { mealTypes } : {}),
        ...(isCycleMenu ? { numberOfCycles } : {}),
        ...(daysOfWeek
          ? {
              draftFoodByDate: createPartnerDraftFoodByDateByDaysOfWeekField(
                daysOfWeek,
                mealTypes,
              ),
            }
          : {}),
      },
      metadata: {
        menuType,
        listingType: ListingTypes.MENU,
        restaurantId,
        listingState: EListingStates.draft,
        ...(geolocation ? { geolocation } : {}),
        state: 'published',
        authorId: restaurant?.author.id.uuid,
      },
    },
    queryParams,
  );

  const [menu] = denormalisedResponseEntities(
    response,
  ) as TIntegrationListing[];

  await updateMenuIdListAndMenuWeekDayListForFood(menu);

  return response;
};

export default createMenu;
