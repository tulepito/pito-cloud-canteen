import { denormalisedResponseEntities } from '@services/data';
import { getIntegrationSdk } from '@services/integrationSdk';
import { getUniqueString, IntegrationListing } from '@src/utils/data';
import type { TIntegrationListing, TObject } from '@src/utils/types';

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

const updateMenuIdListAndMenuWeekDayListForFood = async (
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

export default updateMenuIdListAndMenuWeekDayListForFood;
