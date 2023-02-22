import { fetchSearchFilterApi } from '@apis/userApi';
import { queryAllPages } from '@helpers/apiHelpers';
import { calculateBounds } from '@helpers/mapHelpers';
import { deliveryDaySessionAdapter } from '@helpers/orderHelper';
import { createAsyncThunk } from '@redux/redux.helper';
import { orderAsyncActions } from '@redux/slices/Order.slice';
import { createSlice } from '@reduxjs/toolkit';
import { ListingTypes } from '@src/types/listingTypes';
import { denormalisedResponseEntities, Listing, User } from '@utils/data';
import { convertWeekDay, getDaySessionFromDeliveryTime } from '@utils/dates';
import { EImageVariants } from '@utils/enums';
import type { TListing, TUser } from '@utils/types';
import uniqBy from 'lodash/uniqBy';
import { DateTime } from 'luxon';

// ================ Initial states ================ //
type TKeyValue<T = string> = {
  key: string;
  label: T;
};

type TBookerDraftOrderPageState = {
  menuTypes: TKeyValue[];
  categories: TKeyValue[];
  restaurantIdList: string[];
  companyAccount: TUser | null;
  searchResult: TListing[];
  totalItems: number;
  totalRatings: {
    restaurantId: string;
    totalReviews: number;
  }[];
  combinedRestaurantMenuData: {
    restaurantId: string;
    menuId: string;
  }[];

  fetchFilterInProgress: boolean;
  searchInProgress: boolean;

  fetchCompanyAccountInProgress: boolean;
  fetchCompanyAccountError: any;

  restaurantFood: {
    [restaurantId: string]: TListing[];
  };
  fetchRestaurantFoodInProgress: boolean;
  fetchRestaurantFoodError: any;
};
const initialState: TBookerDraftOrderPageState = {
  menuTypes: [],
  categories: [],
  restaurantIdList: [],
  companyAccount: null,

  searchResult: [],
  totalItems: 0,
  totalRatings: [],
  combinedRestaurantMenuData: [],

  fetchFilterInProgress: false,
  searchInProgress: false,

  fetchCompanyAccountInProgress: false,
  fetchCompanyAccountError: null,

  restaurantFood: {},
  fetchRestaurantFoodInProgress: false,
  fetchRestaurantFoodError: null,
};

// ================ Thunk types ================ //
const FETCH_SEARCH_FILTER = 'app/BookerDraftOrderPage/FETCH_SEARCH_FILTER';
const SEARCH_RESTAURANT = 'app/BookerDraftOrderPage/SEARCH_RESTAURANT';
const FETCH_COMPANY_FROM_ORDER =
  'app/BookerDraftOrderPage/FETCH_COMPANY_FROM_ORDER';
const FETCH_FOOD_LIST_FROM_RESTAURANT =
  'app/BookerDraftOrderPage/FETCH_FOOD_LIST_FROM_RESTAURANT';

// ================ Async thunks ================ //
const fetchSearchFilter = createAsyncThunk(FETCH_SEARCH_FILTER, async () => {
  const { data: searchFiltersResponse } = await fetchSearchFilterApi();
  return searchFiltersResponse;
});

const searchRestaurants = createAsyncThunk(
  SEARCH_RESTAURANT,
  async (params: Record<string, any>, { extra: sdk, getState, dispatch }) => {
    const {
      timestamp,
      favoriteRestaurantIdList = [],
      favoriteFoodIdList = [],
      rating = '',
      menuTypes = [],
      categories = [],
      page = 1,
      orderId,
      keywords = '',
      distance,
    } = params;
    await dispatch(orderAsyncActions.fetchOrder(orderId));
    const dateTime = DateTime.fromMillis(timestamp);
    const { order } = getState().Order;
    const { restaurantIdList = [], companyAccount } =
      getState().BookerDraftOrderPage;
    let newRestaurantIdList = [...restaurantIdList];

    const {
      deliveryHour,
      nutritions = [],
      packagePerMember,
    } = Listing(order as TListing).getMetadata();
    const dayOfWeek = convertWeekDay(dateTime.weekday).key;
    const deliveryDaySession = getDaySessionFromDeliveryTime(deliveryHour);
    const mealType = deliveryDaySessionAdapter(deliveryDaySession);
    const query = {
      meta_listingState: 'published',
      meta_listingType: ListingTypes.MENU,
      pub_startDate: `,${dateTime.toMillis()}`,
      pub_daysOfWeek: `has_any:${dayOfWeek}`,
      pub_mealType: mealType,
      ...(menuTypes.length > 0 ? { meta_menuType: menuTypes.join(',') } : {}),
      ...(categories.length > 0 ? { pub_category: categories.join(',') } : {}),
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
      [`pub_${dayOfWeek}AverageFoodPrice`]: `,${packagePerMember}`,
    };
    const allMenus = await queryAllPages({ sdkModel: sdk.listings, query });
    const combinedRestaurantMenuData = allMenus.map((menu: TListing) => ({
      restaurantId: Listing(menu).getMetadata()?.restaurantId,
      menuId: menu.id.uuid,
    }));
    newRestaurantIdList = uniqBy<{ restaurantId: string; menuId: string }>(
      combinedRestaurantMenuData,
      'restaurantId',
    ).map((item) => item.restaurantId);

    const origin = User(companyAccount as TUser).getPublicData()?.location
      ?.origin;
    const bounds = distance ? calculateBounds(origin, distance) : '';

    const restaurantsResponse = await sdk.listings.query({
      ids: newRestaurantIdList.join(','),
      meta_rating: rating,
      keywords,
      page,
      ...(distance ? { bounds } : {}),
      include: ['images'],
      'fields.image': [
        `variants.${EImageVariants.default}`,
        `variants.${EImageVariants.squareSmall}`,
        `variants.${EImageVariants.landscapeCrop}`,
        `variants.${EImageVariants.landscapeCrop2x}`,
      ],
    });

    const { meta } = restaurantsResponse.data;

    const restaurants = denormalisedResponseEntities(restaurantsResponse);
    const totalRatings = await Promise.all(
      restaurants.map(async (restaurant: TListing) => {
        const restaurantId = restaurant.id.uuid;
        const reviewsResponse = await sdk.reviews.query({
          listingId: restaurantId,
          type: 'ofCustomer',
        });
        const { meta: reviewMeta } = reviewsResponse.data;
        return {
          restaurantId,
          totalReviews: reviewMeta.totalItems,
        };
      }),
    );

    return {
      ...(newRestaurantIdList.length > 0 && {
        restaurantIdList: newRestaurantIdList,
      }),
      searchResult: restaurants,
      combinedRestaurantMenuData,
      totalItems: meta.totalItems,
      totalRatings,
    };
  },
);

const fetchCompanyAccount = createAsyncThunk(
  FETCH_COMPANY_FROM_ORDER,
  async (_, { getState, extra: sdk }) => {
    const { order } = getState().Order;
    const { companyId } = Listing(order as TListing).getMetadata();
    const companyAccount = denormalisedResponseEntities(
      await sdk.users.show({
        id: companyId,
      }),
    )[0];

    return {
      companyAccount,
    };
  },
);

const fetchFoodListFromRestaurant = createAsyncThunk(
  FETCH_FOOD_LIST_FROM_RESTAURANT,
  async (params: Record<string, any>, { getState, extra: sdk }) => {
    const { restaurantId, timestamp } = params;
    const { combinedRestaurantMenuData = [], restaurantFood = {} } =
      getState().BookerDraftOrderPage;
    const dateTime = DateTime.fromMillis(timestamp);
    const dayOfWeek = convertWeekDay(dateTime.weekday).key;
    const menuId = combinedRestaurantMenuData.find(
      (item) => item.restaurantId === restaurantId,
    )?.menuId;
    const { order } = getState().Order;
    const { nutritions = [], packagePerMember } = Listing(
      order as TListing,
    ).getMetadata();

    const response = await sdk.listings.query({
      pub_menuIdList: `has_any:${menuId}`,
      meta_listingType: ListingTypes.FOOD,
      pub_menuWeekDay: `has_any:${dayOfWeek}`,
      price: `,${packagePerMember}`,
      ...(nutritions.length > 0
        ? { pub_nutritions: `has_any:${nutritions.join(',')}` }
        : {}),
      include: ['images'],
    });
    const foodList = denormalisedResponseEntities(response);
    const newRestaurantFood = {
      ...restaurantFood,
      [restaurantId]: foodList,
    };
    return newRestaurantFood;
  },
);

export const BookerDraftOrderPageThunks = {
  searchRestaurants,
  fetchSearchFilter,
  fetchCompanyAccount,
  fetchFoodListFromRestaurant,
};

// ================ Slice ================ //
const BookerDraftOrderPageSlice = createSlice({
  name: 'BookerDraftOrderPage',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSearchFilter.pending, (state) => {
        state.fetchFilterInProgress = true;
      })
      .addCase(fetchSearchFilter.fulfilled, (state, action) => {
        state.fetchFilterInProgress = false;
        state.menuTypes = action.payload.menuTypes;
        state.categories = action.payload.categories;
      })
      .addCase(searchRestaurants.pending, (state) => {
        state.searchInProgress = true;
      })
      .addCase(searchRestaurants.fulfilled, (state, action) => {
        state.searchInProgress = false;
        state.restaurantIdList = action.payload.restaurantIdList ?? [];
        state.searchResult = action.payload.searchResult ?? [];
        state.totalItems = action.payload.totalItems ?? 0;
        state.totalRatings = action.payload.totalRatings ?? [];
        state.combinedRestaurantMenuData =
          action.payload.combinedRestaurantMenuData ?? [];
      })
      .addCase(searchRestaurants.rejected, (state) => {
        state.searchInProgress = false;
      })

      .addCase(fetchCompanyAccount.pending, (state) => {
        state.fetchCompanyAccountInProgress = true;
        state.fetchCompanyAccountError = null;
      })
      .addCase(fetchCompanyAccount.fulfilled, (state, action) => {
        state.companyAccount = action.payload.companyAccount;
        state.fetchCompanyAccountInProgress = false;
      })
      .addCase(fetchCompanyAccount.rejected, (state, { payload }) => {
        state.fetchCompanyAccountInProgress = false;
        state.fetchCompanyAccountError = payload;
      })

      .addCase(fetchFoodListFromRestaurant.pending, (state) => {
        state.fetchRestaurantFoodInProgress = true;
        state.fetchRestaurantFoodError = null;
      })
      .addCase(fetchFoodListFromRestaurant.fulfilled, (state, action) => {
        state.restaurantFood = action.payload;
        state.fetchRestaurantFoodInProgress = false;
      })
      .addCase(fetchFoodListFromRestaurant.rejected, (state, { payload }) => {
        state.fetchRestaurantFoodInProgress = false;
        state.fetchRestaurantFoodError = payload;
      });
  },
});

// ================ Actions ================ //
export const BookerDraftOrderPageActions = BookerDraftOrderPageSlice.actions;
export default BookerDraftOrderPageSlice.reducer;

// ================ Selectors ================ //
