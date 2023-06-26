/* eslint-disable @typescript-eslint/no-loop-func */
/* eslint-disable no-await-in-loop */
import { denormalisedResponseEntities } from '@services/data';
import { getIntegrationSdk } from '@services/integrationSdk';
import { getUniqueString, IntegrationListing } from '@src/utils/data';
import { EDayOfWeek } from '@src/utils/enums';
import type { TIntegrationListing } from '@src/utils/types';

const queryMenuByIdList = async (menuIdList: string[]) => {
  const integrationSdk = getIntegrationSdk();

  const menuResponse = await integrationSdk.listings.query(
    {
      ids: menuIdList.slice(0, 50),
    },
    {
      expand: true,
    },
  );

  const menus = denormalisedResponseEntities(menuResponse);

  return menus;
};

export const updateMenuAfterFoodDeletedByListId = async (foodIds: string[]) => {
  try {
    const integrationSdk = getIntegrationSdk();

    let updateMap: any = {};

    let menuListWithFoodIds: any = {};

    // eslint-disable-next-line no-restricted-syntax
    for (const deletedFoodId of foodIds) {
      const foodResponse = await integrationSdk.listings.show({
        id: deletedFoodId,
      });

      const [deletedFood] = denormalisedResponseEntities(foodResponse);

      const { menuIdList = [] } =
        IntegrationListing(deletedFood).getPublicData();

      const menus = (await queryMenuByIdList(menuIdList)) || [];
      menus.forEach((menu: TIntegrationListing) => {
        menuListWithFoodIds = {
          ...menuListWithFoodIds,
          [menu.id.uuid]: {
            ...menuListWithFoodIds[menu.id.uuid],
            details: menu,
            foodIds: [
              ...(menuListWithFoodIds[menu.id.uuid]?.foodIds || []),
              deletedFoodId,
            ],
          },
        };
      });
    }
    await Promise.all(
      Object.keys(menuListWithFoodIds).map(async (key) => {
        const { details, foodIds: deletedFoodIds = [] } =
          menuListWithFoodIds[key];

        return Promise.all(
          Object.keys(EDayOfWeek).map(async (dayKey) => {
            const day = EDayOfWeek[dayKey as keyof typeof EDayOfWeek];
            const foodIdList =
              IntegrationListing(details).getMetadata()[`${day}FoodIdList`] ||
              [];

            const currentMinFoodPrice =
              IntegrationListing(details).getPublicData()[
                `${day}MinFoodPrice`
              ] || 0;

            const foodsByDate =
              IntegrationListing(details).getPublicData()?.foodsByDate || {};

            const foodsByDay = foodsByDate?.[day];

            deletedFoodIds.forEach((foodId: string) => {
              delete foodsByDay?.[foodId];
            });

            const newFoodIdList = foodIdList.filter(
              (foodId: string) => !deletedFoodIds.includes(foodId),
            );

            let newMinFoodPrice;
            let newFoodTypeList;
            const deletedFoodIsInDay = foodIdList.some((id: string) =>
              deletedFoodIds.includes(id),
            );

            if (deletedFoodIsInDay) {
              const listFoodResponse = await integrationSdk.listings.query({
                ids: newFoodIdList.slice(0, 50),
              });

              const foods = denormalisedResponseEntities(listFoodResponse);

              newMinFoodPrice = foods.reduce(
                (min: number, food: TIntegrationListing, index: number) => {
                  const { price = {} } =
                    IntegrationListing(food).getAttributes();
                  const { amount = 0 } = price;
                  if (index === 0) {
                    return amount;
                  }

                  return amount < min ? amount : min;
                },
                0,
              );
              newFoodTypeList = getUniqueString(
                foods.reduce((prev: string[], f: TIntegrationListing) => {
                  const { foodType } = IntegrationListing(f).getPublicData();
                  if (!foodType) return prev;

                  return [...prev, foodType];
                }, [] as string[]),
              );
            }
            const minPriceChanged = newMinFoodPrice !== currentMinFoodPrice;
            const menuId = IntegrationListing(details).getId();
            updateMap = {
              [menuId]: {
                publicData: {
                  ...(updateMap[menuId as keyof typeof updateMap]?.publicData ||
                    {}),
                  ...(minPriceChanged
                    ? {
                        [`${day}MinFoodPrice`]: newMinFoodPrice,
                      }
                    : {}),
                  foodsByDate: {
                    ...(updateMap[menuId as keyof typeof updateMap]?.publicData
                      ?.foodsByDate || foodsByDate),
                    ...(foodsByDay ? { [day]: foodsByDay } : {}),
                  },
                },
                metadata: {
                  ...(updateMap[menuId as keyof typeof updateMap]?.metadata ||
                    {}),
                  [`${day}FoodIdList`]: newFoodIdList,
                  [`${day}FoodType`]: newFoodTypeList,
                },
              },
            };
          }),
        );
      }),
    );
    const response = await Promise.all(
      Object.keys(updateMap).map(async (menuId) => {
        await integrationSdk.listings.update({
          id: menuId,
          publicData: {
            ...(updateMap[menuId as keyof typeof updateMap]?.publicData || {}),
          },
          metadata: {
            ...(updateMap[menuId as keyof typeof updateMap]?.metadata || {}),
          },
        });
      }),
    );

    return response;
  } catch (error) {
    console.error(`SERVER updateMenuAfterFoodDeletedByListId`, error);
  }
};

export const updateMenuAfterFoodDeleted = async (deletedFoodId: string) => {
  try {
    const integrationSdk = getIntegrationSdk();

    const foodResponse = await integrationSdk.listings.show({
      id: deletedFoodId,
    });

    const [deletedFood] = denormalisedResponseEntities(foodResponse);

    const { menuIdList = [] } = IntegrationListing(deletedFood).getPublicData();

    const menus = await queryMenuByIdList(menuIdList);

    let updateMap: any = {};

    await Promise.all(
      menus.map(async (menu: TIntegrationListing) => {
        return Promise.all(
          Object.keys(EDayOfWeek).map(async (key) => {
            const day = EDayOfWeek[key as keyof typeof EDayOfWeek];
            const foodIdList =
              IntegrationListing(menu).getMetadata()[`${day}FoodIdList`] || [];

            const currentMinFoodPrice =
              IntegrationListing(menu).getPublicData()[`${day}MinFoodPrice`] ||
              0;

            const foodsByDate =
              IntegrationListing(menu).getPublicData()?.foodsByDate;

            const foodsByDay = foodsByDate?.[day];

            delete foodsByDay?.[deletedFoodId];

            const newFoodIdList = foodIdList.filter(
              (foodId: string) => foodId !== deletedFoodId,
            );

            let newMinFoodPrice;
            let newFoodTypeList;

            if (foodIdList.includes(deletedFoodId)) {
              const listFoodResponse = await integrationSdk.listings.query({
                ids: newFoodIdList.slice(0, 50),
              });

              const foods = denormalisedResponseEntities(listFoodResponse);

              newFoodTypeList = getUniqueString(
                foods.reduce((prev: string[], food: TIntegrationListing) => {
                  const { foodType } = IntegrationListing(food).getPublicData();
                  // If menu still has any food has the same food type with the deleted food => Won't do any thing => Else remove that food type from menu
                  if (deletedFoodId !== food.id.uuid) {
                    return prev;
                  }

                  if (!foodType) return prev;

                  return [...prev, foodType];
                }, []),
              );

              newMinFoodPrice = foods.reduce(
                (min: number, food: TIntegrationListing, index: number) => {
                  const { price = {} } =
                    IntegrationListing(food).getAttributes();
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
            const menuId = IntegrationListing(menu).getId();
            updateMap = {
              [menuId]: {
                publicData: {
                  ...(updateMap[menuId as keyof typeof updateMap]?.publicData ||
                    {}),
                  ...(minPriceChanged
                    ? {
                        [`${day}MinFoodPrice`]: newMinFoodPrice,
                      }
                    : {}),
                  foodsByDate: {
                    ...(updateMap[menuId as keyof typeof updateMap]?.publicData
                      ?.foodsByDate || foodsByDate),
                    ...(foodsByDay ? { [day]: foodsByDay } : {}),
                  },
                },
                metadata: {
                  ...(updateMap[menuId as keyof typeof updateMap]?.metadata ||
                    {}),
                  [`${day}FoodIdList`]: newFoodIdList,
                  [`${day}FoodType`]: newFoodTypeList,
                },
              },
            };
          }),
        );
      }),
    );
    const response = await Promise.all(
      Object.keys(updateMap).map(async (menuId) => {
        console.log(updateMap[menuId as keyof typeof updateMap]?.metadata);
        await integrationSdk.listings.update({
          id: menuId,
          publicData: {
            ...(updateMap[menuId as keyof typeof updateMap]?.publicData || {}),
          },
          metadata: {
            ...(updateMap[menuId as keyof typeof updateMap]?.metadata || {}),
          },
        });
      }),
    );

    return response;
  } catch (error) {
    console.error(`SERVER updateMenuAfterFoodDeleted ${deletedFoodId}`, error);
  }
};

export const updateMenuAfterFoodUpdated = async (updatedFoodId: string) => {
  try {
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
        return Promise.all(
          Object.keys(EDayOfWeek).map(async (key) => {
            const day = EDayOfWeek[key as keyof typeof EDayOfWeek];
            const foodIdList =
              IntegrationListing(menu).getMetadata()[`${day}FoodIdList`] || [];

            if (foodIdList.includes(updatedFoodId)) {
              const listFoodResponse = await integrationSdk.listings.query({
                ids: foodIdList.slice(0, 50),
              });

              const foods = denormalisedResponseEntities(listFoodResponse);

              const newMinFoodPrice = foods.reduce(
                (min: number, food: TIntegrationListing, index: number) => {
                  const { price = {} } =
                    IntegrationListing(food).getAttributes();
                  const { amount = 0 } = price;
                  if (index === 0) {
                    return amount;
                  }

                  return amount < min ? amount : min;
                },
                0,
              );

              const newFoodTypeList = getUniqueString(
                foods.reduce((prev: string[], f: TIntegrationListing) => {
                  const { foodType } = IntegrationListing(f).getPublicData();
                  if (!foodType) return prev;

                  return [...prev, foodType];
                }, [] as string[]),
              );

              const menuId = menu.id.uuid;

              updateMap = {
                [menuId]: {
                  publicData: {
                    ...(updateMap?.[menuId]?.publicData || {}),
                    [`${day}MinFoodPrice`]: newMinFoodPrice,
                  },
                  metadata: {
                    ...(updateMap?.[menuId]?.metadata || {}),
                    [`${day}FoodType`]: newFoodTypeList,
                  },
                },
              };
            }
          }),
        );
      }),
    );

    const response = await Promise.all(
      Object.keys(updateMap).map(async (menuId) => {
        await integrationSdk.listings.update({
          id: menuId,
          publicData: {
            ...(updateMap[menuId as keyof typeof updateMap].publicData || {}),
          },
          metadata: {
            ...(updateMap[menuId as keyof typeof updateMap].metadata || {}),
          },
        });
      }),
    );

    return response;
  } catch (error) {
    console.error(`SERVER updateMenuAfterFoodUpdated ${updatedFoodId}`, error);
  }
};
