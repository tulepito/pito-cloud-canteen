/* eslint-disable @typescript-eslint/no-loop-func */
/* eslint-disable no-await-in-loop */
import { chunk, flatten, uniq } from 'lodash';

import { denormalisedResponseEntities } from '@services/data';
import { fetchListing } from '@services/integrationHelper';
import { getIntegrationSdk } from '@services/integrationSdk';
import { getUniqueString, IntegrationListing } from '@src/utils/data';
import {
  EBookerOrderDraftStates,
  EDayOfWeek,
  EListingStates,
  EListingType,
} from '@src/utils/enums';
import type { TIntegrationListing } from '@src/utils/types';

export const fetchListingsByChunkedIds = async (ids: string[], sdk: any) => {
  const listingsResponse = await Promise.all(
    chunk<string>(ids, 100).map(async (_ids) => {
      const response = await sdk.listings.query({
        ids: _ids,
      });

      return denormalisedResponseEntities(response);
    }),
  );

  return flatten(listingsResponse);
};

export const queryMenuByIdList = async (menuIdList: string[]) => {
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

export const updateMenuAfterFoodDeletedByListId = async (foodIds: string[]) => {
  try {
    const integrationSdk = getIntegrationSdk();

    let updateMap: any = {};

    let menuListWithFoodIds: any = {};

    // eslint-disable-next-line no-restricted-syntax
    for (const deletedFoodId of foodIds) {
      const deletedFood = await fetchListing(deletedFoodId);

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
            let newFoodNutritions;
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

              newFoodNutritions = uniq(
                foods.reduce((result: any, food: TIntegrationListing) => {
                  const { specialDiets = [] } =
                    IntegrationListing(food).getPublicData();

                  return [...result, ...specialDiets];
                }, []),
              );
            }
            const minPriceChanged = newMinFoodPrice !== currentMinFoodPrice;
            const menuId = IntegrationListing(details).getId();
            updateMap = {
              ...updateMap,
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
                  [`${day}FoodNutritions`]: newFoodNutritions,
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

    const deletedFood = await fetchListing(deletedFoodId);

    const deletedFoodListing = IntegrationListing(deletedFood);

    const { menuIdList = [] } = deletedFoodListing.getPublicData();

    const menus = await queryMenuByIdList(menuIdList);

    let updateMap: any = {};

    await Promise.all(
      menus.map(async (menu: TIntegrationListing) => {
        return Promise.all(
          Object.keys(EDayOfWeek).map(async (key) => {
            const day = EDayOfWeek[key as keyof typeof EDayOfWeek];
            const menuListing = IntegrationListing(menu);
            const foodIdList =
              menuListing.getMetadata()[`${day}FoodIdList`] || [];

            const currentMinFoodPrice =
              menuListing.getPublicData()[`${day}MinFoodPrice`] || 0;

            const foodsByDate = menuListing.getPublicData()?.foodsByDate;

            const foodsByDay = foodsByDate?.[day];

            delete foodsByDay?.[deletedFoodId];

            const newFoodIdList = foodIdList.filter(
              (foodId: string) => foodId !== deletedFoodId,
            );

            let newMinFoodPrice;
            let newFoodTypeList;
            let newFoodNutritions;

            if (foodIdList.includes(deletedFoodId)) {
              const foods = await fetchListingsByChunkedIds(
                newFoodIdList,
                integrationSdk,
              );

              newFoodTypeList = getUniqueString(
                foods.reduce((prev: string[], food: TIntegrationListing) => {
                  const { foodType } = IntegrationListing(food).getPublicData();
                  // If menu still has any food has the same food type with the deleted food => Won't do any thing => Else remove that food type from menu
                  if (deletedFoodId !== food.id.uuid || !foodType) {
                    return prev;
                  }

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
              newFoodNutritions = uniq(
                foods.reduce((result: any, food: TIntegrationListing) => {
                  const { specialDiets = [] } =
                    IntegrationListing(food).getPublicData();

                  return [...result, ...specialDiets];
                }, []),
              );
            }
            const minPriceChanged = newMinFoodPrice !== currentMinFoodPrice;
            const menuId = IntegrationListing(menu).getId();
            updateMap = {
              ...updateMap,
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
                  [`${day}FoodNutritions`]: newFoodNutritions,
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
    console.error(`SERVER updateMenuAfterFoodDeleted ${deletedFoodId}`, error);
  }
};

export const updateMenuAfterFoodUpdated = async (updatedFoodId: string) => {
  try {
    const integrationSdk = getIntegrationSdk();
    const updatedFood = await fetchListing(updatedFoodId);
    const updatedFoodListing = IntegrationListing(updatedFood);

    const { menuIdList = [], unit: newFoodUnit } =
      updatedFoodListing.getPublicData();
    const {
      price: { amount: newPriceAmount = 0 },
      title: newFoodName,
    } = updatedFoodListing.getAttributes();

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
              const foods = await fetchListingsByChunkedIds(
                foodIdList,
                integrationSdk,
              );

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

              const newFoodNutritions = uniq(
                foods.reduce((result: any, food: TIntegrationListing) => {
                  const { specialDiets = [] } =
                    IntegrationListing(food).getPublicData();

                  return [...result, ...specialDiets];
                }, []),
              );

              const menuId = menu.id.uuid;

              updateMap = {
                ...updateMap,
                [menuId]: {
                  publicData: {
                    ...(updateMap?.[menuId]?.publicData || {}),
                    [`${day}MinFoodPrice`]: newMinFoodPrice,
                  },
                  metadata: {
                    ...(updateMap?.[menuId]?.metadata || {}),
                    [`${day}FoodType`]: newFoodTypeList,
                    [`${day}FoodNutritions`]: newFoodNutritions,
                  },
                },
              };
            }
          }),
        );
      }),
    );

    const plans = denormalisedResponseEntities(
      await integrationSdk.listings.query({
        meta_menuIds: `has_any:${menuIdList.join(',')}`,
        meta_listingType: EListingType.subOrder,
      }),
    );

    const orderIdList = plans.reduce(
      (result: any, plan: TIntegrationListing) => {
        const { orderDetail, orderId } = IntegrationListing(plan).getMetadata();
        const totalFoodIdList = Object.values(orderDetail).reduce<string[]>(
          (totalFoodIdListResult: any, subOrder: any) => {
            return [
              ...totalFoodIdListResult,
              ...Object.keys(subOrder.restaurant.foodList),
            ];
          },
          [],
        );

        if (totalFoodIdList.includes(updatedFoodId)) {
          return [...result, orderId];
        }

        return result;
      },
      [],
    );

    const orders = await fetchListingsByChunkedIds(orderIdList, integrationSdk);

    await Promise.all(
      orders.map(async (order: TIntegrationListing) => {
        const orderListing = IntegrationListing(order);
        const { orderState, plans: orderPlans = [] } =
          orderListing.getMetadata();

        if (
          [
            EListingStates.draft,
            EListingStates.pendingApproval,
            EBookerOrderDraftStates.bookerDraft,
          ].includes(orderState)
        ) {
          const plan = plans.find(
            (p: TIntegrationListing) => p.id.uuid === orderPlans[0],
          );
          const planListing = IntegrationListing(plan);
          const { orderDetail } = planListing.getMetadata();
          const newOrderDetail = Object.keys(orderDetail).reduce(
            (result, subOrderDate: string) => {
              const { restaurant } = orderDetail[subOrderDate];
              const { foodList } = restaurant;

              const newFoodList = Object.keys(foodList).reduce(
                (foodListResult: any, foodId: string) => {
                  const food = foodList[foodId] || {};
                  if (foodId === updatedFoodId) {
                    return {
                      ...foodListResult,
                      [foodId]: {
                        ...food,
                        foodName: newFoodName,
                        foodPrice: newPriceAmount,
                        foodUnit: newFoodUnit,
                      },
                    };
                  }

                  return {
                    ...foodListResult,
                    [foodId]: food,
                  };
                },
                {},
              );

              return {
                ...result,
                [subOrderDate]: {
                  ...orderDetail[subOrderDate],
                  restaurant: {
                    ...restaurant,
                    foodList: newFoodList,
                  },
                },
              };
            },
            orderDetail,
          );

          await integrationSdk.listings.update({
            id: orderPlans[0],
            metadata: {
              orderDetail: newOrderDetail,
            },
          });
        }
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
