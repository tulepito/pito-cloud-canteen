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
        const newFoodIdList = foodIdList.filter(
          (foodId: string) => foodId !== deletedFoodId,
        );
        await integrationSdk.listings.update({
          id: menu.id.uuid,
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

  return Promise.all(
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
            (min: number, food: TIntegrationListing) => {
              const { price = {} } = IntegrationListing(food).getAttributes();
              const { amount = 0 } = price;

              return amount < min ? price : min;
            },
            0,
          );

          return integrationSdk.listings.update({
            id: menu.id.uuid,
            metadata: {
              [`${day}MinFoodPrice`]: newMinFoodPrice,
            },
          });
        }
      });
    }),
  );
};
