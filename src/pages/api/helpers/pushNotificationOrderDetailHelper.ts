import { denormalisedResponseEntities } from '@services/data';
import { fetchListing } from '@services/integrationHelper';
import { createNativeNotificationToPartner } from '@services/nativeNotification';
import { Listing } from '@src/utils/data';
import type { ENativeNotificationType } from '@src/utils/enums';
import type { TListing } from '@src/utils/types';

function groupRestaurantIdInOrderDetails(
  orderDetail: any,
): Record<string, string[]> {
  return Object.keys(orderDetail).reduce((accumulator, key) => {
    const item = orderDetail[key];
    if (!item) {
      return accumulator;
    }

    if (!item.restaurant) {
      return accumulator;
    }

    const { id = '' } = item.restaurant;
    if (id) {
      if (!accumulator[id]) {
        accumulator[id] = [];
      }
      accumulator[id].push(key); // Add the item to the corresponding group
    }

    return accumulator;
  }, {} as Record<string, string[]>);
}
export async function pushNativeNotificationOrderDetail(
  orderDetail: any,
  orderListing: TListing,
  nativeNotificationType: ENativeNotificationType,
  sdk: any,
) {
  const groupedRestaurantIdInOrderDetails =
    groupRestaurantIdInOrderDetails(orderDetail);

  const ids = Object.keys(groupedRestaurantIdInOrderDetails);
  if (!ids.length) return;

  const restaurants: any[] = denormalisedResponseEntities(
    await sdk.listings.query({
      ids,
      include: ['author'],
    }),
  );
  restaurants.forEach((restaurant: TListing) => {
    const subOrderDates = groupedRestaurantIdInOrderDetails[restaurant.id.uuid];

    const userPartner = restaurant.author;
    if (!userPartner) return;

    subOrderDates.forEach((value) => {
      createNativeNotificationToPartner(nativeNotificationType, {
        partner: userPartner,
        order: orderListing,
        subOrderDate: value,
      });
    });
  });
}

export async function pushNativeNotificationSubOrderDate(
  restaurantId: any,
  subOrderDate: string,
  orderListing: TListing,
  nativeNotificationType: ENativeNotificationType,
  sdk: any,
) {
  const [restaurant] = denormalisedResponseEntities(
    await sdk.listings.show({
      id: restaurantId,
      include: ['author'],
    }),
  );

  const userPartner = restaurant?.author;
  if (!userPartner) return;

  createNativeNotificationToPartner(nativeNotificationType, {
    partner: userPartner,
    order: orderListing,
    subOrderDate,
  });
}

export async function pushNativeNotificationFood(
  foodId: string,
  nativeNotificationType: ENativeNotificationType,
) {
  const food = await fetchListing(foodId);

  if (!food) {
    return;
  }
  const foodListing = Listing(food);
  const { title: foodName } = foodListing.getAttributes();
  const { restaurantId } = foodListing.getMetadata();

  const restaurant = await fetchListing(restaurantId, ['author']);
  const { author: userPartner } = restaurant;
  if (userPartner) {
    createNativeNotificationToPartner(nativeNotificationType, {
      partner: userPartner,
      foodId,
      foodName,
    });
  }
}
