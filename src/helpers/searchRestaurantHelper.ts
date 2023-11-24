import * as unidecode from 'unidecode';

import { calculateDistance } from '@helpers/mapHelpers';
import type { TFoodInRestaurant } from '@src/types/bookerSelectRestaurant';
import { Listing } from '@src/utils/data';
import type { TListing } from '@src/utils/types';

export function searchTitle(
  title: string | null | undefined,
  keywords: string | undefined,
): boolean {
  if (!keywords || !title) return false;

  const unidecodeTitle = String(unidecode(keywords));
  const unidecodeKeywords = String(unidecode(title));
  const keyWordsSet = new Set(
    unidecodeKeywords.trim().toLowerCase().split(' '),
  );

  return unidecodeTitle
    .trim()
    .toLowerCase()
    .split(' ')
    .some((word) => keyWordsSet.has(word));
}

export function filterRestaurant(
  restaurant: TListing,
  timestamp: number,
  deliveryAddress: any,
) {
  const restaurantListing = Listing(restaurant);

  const {
    stopReceiveOrder = false,
    startStopReceiveOrderDate = 0,
    endStopReceiveOrderDate = 0,
  } = restaurantListing.getPublicData();
  const isInStopReceiveOrderTime =
    stopReceiveOrder &&
    Number(timestamp) >= startStopReceiveOrderDate &&
    Number(timestamp) <= endStopReceiveOrderDate;

  const { geolocation: restaurantOrigin } = restaurantListing.getAttributes();

  const distanceToDeliveryPlace = calculateDistance(
    deliveryAddress?.origin,
    restaurantOrigin,
  );
  const isValidRestaurant =
    !isInStopReceiveOrderTime &&
    distanceToDeliveryPlace <=
      Number(
        process.env
          .NEXT_PUBLIC_MAX_KILOMETER_FROM_RESTAURANT_TO_DELIVERY_ADDRESS_FOR_BOOKER,
      );

  return isValidRestaurant;
}

export function parseFoodsFromMenu(
  menu: TListing,
  dayOfWeek: string,
  mapfoods: Map<string, TListing>,
  packagePerMember: number,
): TFoodInRestaurant[] {
  const result: TFoodInRestaurant[] = [];
  const menuListing = Listing(menu);
  const foodInList = menuListing.getPublicData().foodsByDate[dayOfWeek];
  const { restaurantId } = menuListing.getMetadata();
  Object.keys(foodInList).forEach((key) => {
    const foodMenu = foodInList[key];
    const food = mapfoods.get(key);
    if (foodMenu && food) {
      const foodListing = Listing(food);
      const { price, title } = foodListing.getAttributes();
      if (price.amount <= packagePerMember)
        result.push({
          restaurantId,
          foodId: key,
          foodName: title,
          minQuantity: foodListing.getPublicData().minQuantity ?? 0,
          price: price.amount,
        });
    }
  });

  return result;
}

export function findFoodTitleInMenus(
  menus: TListing[],
  dayOfWeek: any | undefined | null,
  keywords: string | undefined,
  mapFoodId: Map<string, TListing>,
  packagePerMember: number,
) {
  let menu: TListing | undefined;
  const foods: TFoodInRestaurant[] = [];

  for (let i = 0; i < menus.length; i++) {
    const menuListing = Listing(menus[i]);
    const foodIdList: string[] | null | undefined =
      menuListing.getMetadata()[`${dayOfWeek}FoodIdList`];
    if (foodIdList) {
      const combinedFoodsMenuData = parseFoodsFromMenu(
        menus[i],
        dayOfWeek,
        mapFoodId,
        packagePerMember,
      );
      if (
        combinedFoodsMenuData.findIndex((food) => {
          const { foodName } = food;

          return foodName && searchTitle(foodName, keywords);
        }) >= 0
      ) {
        menu = menus[i];
        foods.push(...combinedFoodsMenuData);
        break;
      }
    }
  }

  return {
    menu,
    foods,
  };
}
