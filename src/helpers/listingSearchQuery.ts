import { DateTime } from 'luxon';

import { calculateBounds } from '@helpers/mapHelpers';
import {
  deliveryDaySessionAdapter,
  mealTypeAdapter,
} from '@helpers/orderHelper';
import { Listing, User } from '@utils/data';
import { convertWeekDay, VNTimezone } from '@utils/dates';
import type { EFoodApprovalState } from '@utils/enums';
import {
  EImageVariants,
  EListingStates,
  EListingType,
  EOrderStates,
  ERestaurantListingStatus,
} from '@utils/enums';
import type { TListing, TObject, TUser } from '@utils/types';

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
    nutritions = [],
    mealType: mealFoodType = [],
    packagePerMember,
    daySession,
  } = Listing(order as TListing).getMetadata();
  const dateTime = DateTime.fromMillis(timestamp).setZone(VNTimezone);
  const dayOfWeek = convertWeekDay(dateTime.weekday).key;
  const mealType = deliveryDaySessionAdapter(daySession);
  const convertedMealFoodType = mealFoodType.map((item: string) =>
    mealTypeAdapter(item),
  );

  const query = {
    meta_listingState: EListingStates.published,
    meta_listingType: EListingType.menu,
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
    ...(mealFoodType.length > 0
      ? {
          [`meta_${dayOfWeek}FoodType`]: `has_any:${convertedMealFoodType.join(
            ',',
          )}`,
        }
      : {}),
    ...(keywords && { keywords }),
    ...(page && { page }),
    ...(perPage && { perPage }),
  };

  return query;
};

export const getMenuQueryWithDraftOrderData = ({
  params,
  orderParams,
}: any) => {
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
    nutritions = [],
    mealType: mealFoodType = [],
    packagePerMember,
    daySession,
  } = orderParams;
  const dateTime = DateTime.fromMillis(timestamp).setZone(VNTimezone);
  const dayOfWeek = convertWeekDay(dateTime.weekday).key;
  const mealType = deliveryDaySessionAdapter(daySession);
  const convertedMealFoodType = mealFoodType.map((item: string) =>
    mealTypeAdapter(item),
  );

  const query = {
    meta_listingState: EListingStates.published,
    meta_listingType: EListingType.menu,
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
    ...(mealFoodType.length > 0
      ? {
          [`meta_${dayOfWeek}FoodType`]: `has_any:${convertedMealFoodType.join(
            ',',
          )}`,
        }
      : {}),
    ...(keywords && { keywords }),
    ...(page && { page }),
    ...(perPage && { perPage }),
  };

  return query;
};

export const getRestaurantQuery = ({
  restaurantIds,
  companyAccount,
  params,
}: {
  restaurantIds: string[];
  companyAccount: TUser | null;
  params: TObject;
}) => {
  const {
    rating = '',
    page = 1,
    keywords = '',
    distance,
    categories = [],
    packaging = [],
    memberAmount,
    startDate,
    endDate,
  } = params;

  const origin = User(companyAccount as TUser).getPublicData()?.location
    ?.origin;
  const bounds = distance ? calculateBounds(origin, distance) : '';
  const query = {
    ids: restaurantIds,
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
    ...(memberAmount && {
      pub_minQuantity: `,${memberAmount + 1}`,
    }),
    ...(memberAmount && {
      pub_maxQuantity: `${memberAmount},`,
    }),
    ...(startDate && {
      pub_startStopReceiveOrderDate: `,${startDate + 1}`,
    }),
    ...(endDate && {
      pub_endStopReceiveOrderDate: `${endDate},`,
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

  return query;
};

export const getMenuQueryInSpecificDay = ({
  order,
  timestamp,
}: {
  order: TListing | null;
  timestamp: number;
}) => {
  const {
    nutritions = [],
    mealType: mealFoodType = [],
    packagePerMember,
    daySession,
  } = Listing(order as TListing).getMetadata();

  const dateTime = DateTime.fromMillis(timestamp).setZone(VNTimezone);
  const dayOfWeek = convertWeekDay(dateTime.weekday).key;
  const mealType = deliveryDaySessionAdapter(daySession);
  const convertedMealFoodType = mealFoodType.map((item: string) =>
    mealTypeAdapter(item),
  );
  const query = {
    meta_listingState: EListingStates.published,
    meta_listingType: EListingType.menu,
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
    ...(mealFoodType.length > 0
      ? {
          [`meta_${dayOfWeek}FoodType`]: `has_any:${convertedMealFoodType.join(
            ',',
          )}`,
        }
      : {}),
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
    meta_listingType: EListingType.quotation,
    meta_orderId: orderId,
    ...(status && { meta_status: status }),
  };

  return query;
};

export const getParticipantOrdersQueries = ({
  userId,
  startDate,
  endDate,
}: {
  userId: string;
  startDate: number;
  endDate: number;
}) => {
  const queries = [
    {
      meta_listingType: EListingType.order,
      meta_participants: `has_any:${userId}`,
      meta_orderState: Object.values(EOrderStates).join(','),
      meta_startDate: `${startDate},${endDate + 1}`,
    },
    {
      meta_listingType: EListingType.order,
      meta_anonymous: `has_any:${userId}`,
      meta_orderState: Object.values(EOrderStates).join(','),
      meta_startDate: `${startDate},${endDate + 1}`,
    },
  ];

  return queries;
};

type TGetOrderQuery = {
  foodIds: string[];
  params: {
    allergicIngredients?: string[];
    specialDiets?: string[];
  };
};
export const getFoodQuery = ({ foodIds, params }: TGetOrderQuery) => {
  const { specialDiets } = params;
  const query = {
    ids: foodIds,
    meta_listingType: EListingType.food,
    ...(specialDiets ? { pub_specialDiets: `has_any:${specialDiets}` } : {}),
  };

  return query;
};

export const getPartnerFoodByApprovalStatusQuery = (
  status: EFoodApprovalState,
  restaurantListingId: string,
) => {
  return {
    meta_adminApproval: status,
    meta_restaurantId: restaurantListingId,
    meta_listingType: EListingType.food,
    meta_isDraft: false,
    meta_isDeleted: false,
  };
};

export const getPartnerDraftFoodQuery = (restaurantListingId: string) => {
  return {
    meta_restaurantId: restaurantListingId,
    meta_listingType: EListingType.food,
    meta_isDraft: true,
    meta_isDeleted: false,
  };
};

export type TgetPartnerMenuQueryParams = {
  keywords?: string;
  startDate?: number;
  endDate?: number;
};
export const getPartnerMenuQuery = (
  restaurantId: string,
  params: TgetPartnerMenuQueryParams,
) => {
  const { keywords, startDate, endDate } = params;

  return {
    ...(keywords && { keywords }),
    ...(startDate && {
      pub_startDate: `${startDate},`,
    }),
    ...(endDate && {
      pub_endDate: `,${endDate + 1}`,
    }),
    meta_listingType: EListingType.menu,
    meta_restaurantId: restaurantId,
    meta_listingState: EListingStates.published,
    meta_isDeleted: false,
  };
};
