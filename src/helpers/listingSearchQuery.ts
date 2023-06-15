import uniqBy from 'lodash/uniqBy';
import { DateTime } from 'luxon';

import { calculateBounds } from '@helpers/mapHelpers';
import { deliveryDaySessionAdapter } from '@helpers/orderHelper';
import { ListingTypes } from '@src/types/listingTypes';
import { Listing, User } from '@utils/data';
import { convertWeekDay, getDaySessionFromDeliveryTime } from '@utils/dates';
import {
  EImageVariants,
  EOrderStates,
  ERestaurantListingStatus,
} from '@utils/enums';
import type { TListing, TUser } from '@utils/types';

export type TMenuQueryParams = {
  timestamp: number;
  menuTypes?: string[];
  favoriteRestaurantIdList?: string[];
  favoriteFoodIdList?: string[];
  keywords?: string;
  page?: number;
  perPage?: number;
  orderId?: string;
};
export const getMenuQuery = ({
  order,
  params,
}: {
  order: TListing | null;
  params: TMenuQueryParams;
}) => {
  const {
    timestamp,
    menuTypes = [],
    favoriteRestaurantIdList = [],
    favoriteFoodIdList = [],
    keywords = '',
    page,
    perPage,
  } = params;
  const {
    deliveryHour,
    nutritions = [],
    packagePerMember,
  } = Listing(order as TListing).getMetadata();
  const dateTime = DateTime.fromMillis(timestamp);
  const dayOfWeek = convertWeekDay(dateTime.weekday).key;
  const deliveryDaySession = getDaySessionFromDeliveryTime(deliveryHour);
  const mealType = deliveryDaySessionAdapter(deliveryDaySession);

  const query = {
    meta_listingState: 'published',
    meta_listingType: ListingTypes.MENU,
    pub_startDate: `,${dateTime.toMillis() + 1}`,
    pub_endDate: `${dateTime.toMillis()},`,
    pub_daysOfWeek: `has_any:${dayOfWeek}`,
    pub_mealType: mealType,
    meta_isDeleted: false,
    ...(menuTypes.length > 0 ? { meta_menuType: menuTypes.join(',') } : {}),
    ...(nutritions.length > 0
      ? {
          [`meta_${dayOfWeek}Nutritions`]: `has_any:${nutritions.join(',')}`,
        }
      : {}),
    ...(favoriteRestaurantIdList.length > 0
      ? {
          meta_restaurantId: favoriteRestaurantIdList.join(','),
        }
      : {}),
    ...(favoriteFoodIdList.length > 0
      ? {
          [`meta_${dayOfWeek}FoodIdList`]: `has_any:${favoriteFoodIdList.join(
            ',',
          )}`,
        }
      : {}),
    [`pub_${dayOfWeek}MinFoodPrice`]: `,${packagePerMember + 1}`,
    ...(keywords && { keywords }),
    ...(page && { page }),
    ...(perPage && { perPage }),
  };

  return query;
};

export const getRestaurantQuery = ({
  menuList,
  restaurantIds,
  companyAccount,
  params,
}: {
  menuList: any;
  restaurantIds: string[];
  companyAccount: TUser | null;
  params: any;
}) => {
  const {
    rating = '',
    page = 1,
    keywords = '',
    distance,
    categories = [],
    packaging = [],
  } = params;

  let newRestaurantIds = [...restaurantIds];

  newRestaurantIds = uniqBy<{ restaurantId: string; menuId: string }>(
    menuList,
    'restaurantId',
  ).map((item) => item.restaurantId);

  const origin = User(companyAccount as TUser).getPublicData()?.location
    ?.origin;
  const bounds = distance ? calculateBounds(origin, distance) : '';
  const query = {
    ids: newRestaurantIds.slice(0, 50),
    keywords,
    page,
    ...(rating && { meta_rating: `${rating},` }),
    ...(distance ? { bounds } : {}),
    ...(categories.length > 0
      ? { pub_categories: `has_all:${categories.join(',')}` }
      : {}),
    ...(packaging.length > 0 && {
      pub_packaging: `has_any:${packaging.join(',')}`,
    }),
    meta_status: ERestaurantListingStatus.authorized,
    include: ['images'],
    'fields.image': [
      `variants.${EImageVariants.default}`,
      `variants.${EImageVariants.squareSmall}`,
      `variants.${EImageVariants.landscapeCrop}`,
      `variants.${EImageVariants.landscapeCrop2x}`,
    ],
  };

  return {
    query,
    restaurantIds: newRestaurantIds,
  };
};

export const getMenuQueryInSpecificDay = ({
  order,
  timestamp,
}: {
  order: TListing | null;
  timestamp: number;
}) => {
  const {
    deliveryHour,
    nutritions = [],
    packagePerMember,
  } = Listing(order as TListing).getMetadata();
  const dateTime = DateTime.fromMillis(timestamp);
  const dayOfWeek = convertWeekDay(dateTime.weekday).key;
  const deliveryDaySession = getDaySessionFromDeliveryTime(deliveryHour);
  const mealType = deliveryDaySessionAdapter(deliveryDaySession);
  const query = {
    meta_listingState: 'published',
    meta_listingType: ListingTypes.MENU,
    pub_startDate: `,${dateTime.toMillis() + 1}`,
    pub_endDate: `${dateTime.toMillis()},`,
    pub_daysOfWeek: `has_any:${dayOfWeek}`,
    pub_mealType: mealType,
    meta_isDeleted: false,
    ...(nutritions.length > 0
      ? {
          [`meta_${dayOfWeek}Nutritions`]: `has_any:${nutritions.join(',')}`,
        }
      : {}),
    [`pub_${dayOfWeek}MinFoodPrice`]: `,${packagePerMember + 1}`,
  };

  return query;
};

export const getOrderQuotationsQuery = ({
  orderId,
  status,
}: {
  orderId: string;
  status?: 'active' | 'inactive';
}) => {
  const query = {
    meta_listingType: ListingTypes.QUOTATION,
    meta_orderId: orderId,
    ...(status && { meta_status: status }),
  };

  return query;
};

export const getParticipantOrdersQuery = ({ userId }: { userId: string }) => {
  const query = {
    meta_listingType: ListingTypes.ORDER,
    meta_participants: `has_any:${userId}`,
    meta_orderState: Object.values(EOrderStates).join(','),
  };

  return query;
};
