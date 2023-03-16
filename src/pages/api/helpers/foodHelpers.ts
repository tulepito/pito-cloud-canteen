import { denormalisedResponseEntities } from '@services/data';
import { getIntegrationSdk } from '@services/integrationSdk';
import { IntegrationListing } from '@src/utils/data';
import { EDayOfWeek } from '@src/utils/enums';
import type { TIntegrationListing } from '@src/utils/types';

const queryMenuByIdList = async (menuIdList: string[]) => {
  const integrationSdk = getIntegrationSdk();

  const menuResponse = await integrationSdk.listings.query(
    {
      ids: menuIdList,
    },
    {
      expand: true,
    },
  );

  const menus = denormalisedResponseEntities(menuResponse);

  return menus;
};

export const updateMenuAfterFoodDeleted = async (deletedFoodId: string) => {
  const integrationSdk = getIntegrationSdk();

  const foodResponse = await integrationSdk.listings.show({
    id: deletedFoodId,
  });

  const [deletedFood] = denormalisedResponseEntities(foodResponse);

  const { menuIdList = [] } = IntegrationListing(deletedFood).getPublicData();

  const menus = await queryMenuByIdList(menuIdList);

  return Promise.all(
    menus.map(async (menu: TIntegrationListing) => {
      Object.keys(EDayOfWeek).map(async (key) => {
        const day = EDayOfWeek[key as keyof typeof EDayOfWeek];
        const foodIdList =
          IntegrationListing(menu).getMetadata()[`${day}FoodIdList`];

        const currentMinFoodPrice =
          IntegrationListing(menu).getPublicData()[`${day}MinFoodPrice`];

        const foodsByDate =
          IntegrationListing(menu).getPublicData()?.foodsByDate;

        const foodsByDay = foodsByDate?.[day];

        delete foodsByDay?.[deletedFoodId];

        const newFoodIdList = foodIdList.filter(
          (foodId: string) => foodId !== deletedFoodId,
        );

        let newMinFoodPrice;

        if (foodIdList.includes(deletedFoodId)) {
          const listFoodResponse = await integrationSdk.listings.query({
            ids: newFoodIdList,
          });

          const foods = denormalisedResponseEntities(listFoodResponse);

          newMinFoodPrice = foods.reduce(
            (min: number, food: TIntegrationListing, index: number) => {
              const { price = {} } = IntegrationListing(food).getAttributes();
              const { amount = 0 } = price;
              if (index === 0) {
                return amount;
              }

              return amount < min ? amount : min;
            },
            0,
          );
        }
        const minPriceChanged = newMinFoodPrice !== currentMinFoodPrice;

        await integrationSdk.listings.update({
          id: menu.id.uuid,

          publicData: {
            ...(minPriceChanged
              ? {
                  [`${day}MinFoodPrice`]: newMinFoodPrice,
                }
              : {}),
            foodsByDate: {
              ...foodsByDate,
              [day]: foodsByDay,
            },
          },
          metadata: {
            [`${day}FoodIdList`]: newFoodIdList,
          },
        });
      });
    }),
  );
};

export const updateMenuAfterFoodUpdated = async (updatedFoodId: string) => {
  const integrationSdk = getIntegrationSdk();

  const foodResponse = await integrationSdk.listings.show({
    id: updatedFoodId,
  });

  const [updatedFood] = denormalisedResponseEntities(foodResponse);

  const { menuIdList = [] } = IntegrationListing(updatedFood).getPublicData();

  const menus = await queryMenuByIdList(menuIdList);

  let updateMap: any = {};

  await Promise.all(
    menus.map(async (menu: TIntegrationListing) => {
      Object.keys(EDayOfWeek).map(async (key) => {
        const day = EDayOfWeek[key as keyof typeof EDayOfWeek];
        const foodIdList =
          IntegrationListing(menu).getMetadata()[`${day}FoodIdList`];

        if (foodIdList.includes(updatedFoodId)) {
          const listFoodResponse = await integrationSdk.listings.query({
            ids: foodIdList,
          });

          const foods = denormalisedResponseEntities(listFoodResponse);

          const newMinFoodPrice = foods.reduce(
            (min: number, food: TIntegrationListing, index: number) => {
              const { price = {} } = IntegrationListing(food).getAttributes();
              const { amount = 0 } = price;
              if (index === 0) {
                return amount;
              }

              return amount < min ? amount : min;
            },
            0,
          );

          const menuId = menu.id.uuid;

          updateMap = {
            [menu.id.uuid]: {
              ...(updateMap[menuId as keyof typeof updateMap] || {}),
              [`${day}MinFoodPrice`]: newMinFoodPrice,
            },
          };
        }
      });
    }),
  );
};
