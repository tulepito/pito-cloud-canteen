import isEmpty from 'lodash/isEmpty';

import { denormalisedResponseEntities, Listing } from '@src/utils/data';
import type {
  TCreateMenuApiParams,
  TListing,
  TObject,
  TUpdateMenuApiParams,
} from '@src/utils/types';

import createMenu from './createMenu.service';
import updateMenu from './updateMenu.service';

const createSubMenu = async (
  dataParams: TCreateMenuApiParams,
  queryParams: TObject = {},
) => {
  const [subMenuListing] = denormalisedResponseEntities(
    await createMenu(dataParams, queryParams),
  );

  return Listing(subMenuListing as TListing).getId();
};

const publishDraftMenu = async (
  menuId: string,
  dataParams: TUpdateMenuApiParams,
  _queryParams: TObject = {},
) => {
  const {
    menuType,
    mealType,
    mealTypes = [],
    startDate,
    daysOfWeek,
    restaurantId,
    draftFoodByDate = {},
    title,
    endDate,
    numberOfCycles = 1,
  } = dataParams;

  const menuFoodByDate = draftFoodByDate[mealType] || {};
  const isAllMenuMealsEmpty = Object.values(menuFoodByDate).every((item) =>
    isEmpty(item),
  );
  const needPublishMenuIds: string[] = isAllMenuMealsEmpty ? [] : [menuId];

  await updateMenu(
    menuId,
    {
      id: menuId,
      menuType,
      mealType,
      startDate,
      restaurantId,
      ...(isAllMenuMealsEmpty
        ? {
            mealTypes: [mealType],
            draftFoodByDate: {
              [mealType]: menuFoodByDate,
            },
          }
        : { foodsByDate: menuFoodByDate }),
      title,
      endDate,
      numberOfCycles,
    },
    {},
  );

  if (mealTypes.length > 1) {
    await Promise.all(
      mealTypes.slice(1, mealTypes.length).map(async (meal: any) => {
        const subMenuId = await createSubMenu(
          {
            menuType,
            mealType: meal,
            startDate,
            daysOfWeek: daysOfWeek!,
            restaurantId,
            title,
            numberOfCycles,
            endDate,
          },
          {},
        );
        const subMenuFoodsByDate = draftFoodByDate[meal] || {};
        if (subMenuFoodsByDate) {
          const isAllSubMenuFoodByDateEmpty = Object.values(
            subMenuFoodsByDate,
          ).every((item) => isEmpty(item));

          if (!isAllSubMenuFoodByDateEmpty) needPublishMenuIds.push(subMenuId);

          await updateMenu(
            subMenuId,
            {
              id: subMenuId,
              menuType,
              mealType: meal,
              startDate,
              restaurantId,
              ...(isAllSubMenuFoodByDateEmpty
                ? {
                    mealTypes: [meal],
                    draftFoodByDate: { [meal]: subMenuFoodsByDate },
                  }
                : { foodsByDate: subMenuFoodsByDate }),
              title,
              endDate,
              numberOfCycles,
            },
            {},
          );
        }
      }),
    );
  }

  return needPublishMenuIds;
};

export default publishDraftMenu;
