import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';

import { errorMessages } from '@apis/errors';
import type { TCheckUnConflictedParams } from '@helpers/apiHelpers';
import { getIntegrationSdk } from '@services/integrationSdk';
import { handleError } from '@services/sdk';
import {
  denormalisedResponseEntities,
  getUniqueString,
  IntegrationListing,
} from '@utils/data';
import { findClassDays } from '@utils/dates';
import { EListingStates, EListingType } from '@utils/enums';
import type { TIntegrationListing, TObject } from '@utils/types';

const getWeekDayFromListId = (menu: TIntegrationListing, foodId: string) => {
  const {
    monFoodIdList = [],
    tueFoodIdList = [],
    wedFoodIdList = [],
    thuFoodIdList = [],
    friFoodIdList = [],
    satFoodIdList = [],
    sunFoodIdList = [],
  } = IntegrationListing(menu).getMetadata();
  const listIds = {
    sunFoodIdList,
    tueFoodIdList,
    monFoodIdList,
    wedFoodIdList,
    thuFoodIdList,
    friFoodIdList,
    satFoodIdList,
  } as TObject;
  const keys = Object.keys(listIds).filter((key: string) => {
    return listIds[key].includes(foodId);
  });
  return keys.map((k) => String(k).substring(0, 3));
};

export const updateMenuIdListAndMenuWeekDayListForFood = async (
  menu: TIntegrationListing,
) => {
  const {
    monFoodIdList = [],
    tueFoodIdList = [],
    wedFoodIdList = [],
    thuFoodIdList = [],
    friFoodIdList = [],
    satFoodIdList = [],
    sunFoodIdList = [],
  } = IntegrationListing(menu).getMetadata();
  const menuId = IntegrationListing(menu).getId();
  const foodIds = getUniqueString([
    ...monFoodIdList,
    ...tueFoodIdList,
    ...wedFoodIdList,
    ...thuFoodIdList,
    ...friFoodIdList,
    ...satFoodIdList,
    ...sunFoodIdList,
  ]);
  const integrationSdk = getIntegrationSdk();

  let updatedFoods: TObject[] = [];

  if (foodIds.length > 0) {
    updatedFoods = await Promise.all(
      foodIds.map(async (id) => {
        const foodResponse = await integrationSdk.listings.show(
          {
            id,
          },
          { expand: true },
        );
        const [listing] = denormalisedResponseEntities(foodResponse);
        const { menuIdList = [], menuWeekDay = [] } =
          IntegrationListing(listing).getPublicData();
        const newMenuIdList = getUniqueString([...menuIdList, menuId]);
        const newMenuWeekDay = getUniqueString([
          ...menuWeekDay,
          ...getWeekDayFromListId(menu, id),
        ]);

        await integrationSdk.listings.update({
          id,
          publicData: {
            menuIdList: newMenuIdList,
            menuWeekDay: newMenuWeekDay,
          },
        });

        return { id, menuIdList: newMenuIdList, menuWeekDay: newMenuWeekDay };
      }),
    );
  }

  const response = await integrationSdk.listings.query(
    {
      pub_menuIdList: menuId,
    },
    { expand: true },
  );

  const addedFoods = denormalisedResponseEntities(
    response,
  ) as TIntegrationListing[];

  return Promise.all(
    addedFoods.map(async (addedFood) => {
      const addedFoodId = IntegrationListing(addedFood).getId();
      const { menuIdList = [], menuWeekDay = [] } =
        IntegrationListing(addedFood).getPublicData();
      const updatedMenuIdList =
        (updatedFoods.find((f) => f.id === addedFoodId)
          ?.menuIdList as unknown as string[]) || [];
      const alreadyRemoved = !updatedMenuIdList.includes(menuId);

      let newMenuWeekDay = [...menuWeekDay];
      let needToUpdateMenuWeekDay = false;

      await Promise.all(
        menuWeekDay.map(async (day: string) => {
          const menuResponse = await integrationSdk.listings.query({
            page: 1,
            perPage: 1,
            [`meta_${day}FoodIdList`]: addedFoodId,
          });
          const foods = denormalisedResponseEntities(menuResponse);

          if (foods.length === 0) {
            newMenuWeekDay = newMenuWeekDay.filter((mDay) => mDay !== day);
            needToUpdateMenuWeekDay = true;
          }
        }),
      );

      const newMenuIdList = menuIdList.filter((id: string) => id !== menuId);
      await integrationSdk.listings.update({
        id: addedFoodId,
        publicData: {
          ...(alreadyRemoved ? { menuIdList: newMenuIdList } : {}),
          ...(needToUpdateMenuWeekDay ? { menuWeekDay: newMenuWeekDay } : {}),
        },
      });
    }),
  );
};

export const checkUnConflictedMenuMiddleware =
  (handler: NextApiHandler) =>
  async (
    req: NextApiRequest,
    res: NextApiResponse,
    params: TCheckUnConflictedParams,
  ) => {
    try {
      const integrationSdk = getIntegrationSdk();
      const {
        mealType,
        daysOfWeek = [],
        restaurantId,
        id,
        startDate,
        endDate,
      } = params;

      const daysOfWeekAsString = daysOfWeek.join(',');
      const listingStatesAsString = [
        EListingStates.published,
        EListingStates.draft,
      ].join(',');
      const response = await integrationSdk.listings.query({
        pub_mealType: mealType,
        pub_daysOfWeek: `has_any:${daysOfWeekAsString}`,
        meta_listingType: EListingType.menu,
        meta_restaurantId: restaurantId,
        meta_isDeleted: false,
        meta_listingState: listingStatesAsString,
      });

      const listings = denormalisedResponseEntities(
        response,
      ) as TIntegrationListing[];

      const inValidListings = listings.filter((l) => {
        const {
          startDate: listingStartDate,
          endDate: listingEndDate,
          daysOfWeek: listingDayOfWeek,
        } = IntegrationListing(l).getPublicData();

        const daysOfWeekInRange = findClassDays(
          daysOfWeek,
          new Date(startDate),
          new Date(endDate),
        );

        const listingDaysOfWeekInRange = findClassDays(
          listingDayOfWeek,
          new Date(listingStartDate),
          new Date(listingEndDate),
        );

        return daysOfWeekInRange.some((d) =>
          listingDaysOfWeekInRange.includes(d),
        );
      });

      const listingWithoutNewMenu = id
        ? inValidListings.filter((l) => l.id.uuid !== id)
        : inValidListings;

      if (listingWithoutNewMenu.length > 0 && daysOfWeek.length > 0) {
        return handleError(res, {
          status: errorMessages.VALIDATE_MENU_ERROR_CONFLICT.code,
          statusText: errorMessages.VALIDATE_MENU_ERROR_CONFLICT.id,
          data: {
            message: errorMessages.VALIDATE_MENU_ERROR_CONFLICT.message,
            data: {
              mealType,
              daysOfWeek,
              restaurantId,
              id,
            },
          },
        });
      }
      return handler(req, res);
    } catch (error) {
      console.error('error', error);
      handleError(res, error);
    }
  };
