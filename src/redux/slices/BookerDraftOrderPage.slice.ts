import { fetchSearchFilterApi } from '@apis/userApi';
import { queryAllPages } from '@helpers/apiHelpers';
import { calculateBounds } from '@helpers/mapHelpers';
import { deliveryDaySessionAdapter } from '@helpers/orderHelper';
import { createAsyncThunk } from '@redux/redux.helper';
import { createSlice } from '@reduxjs/toolkit';
import { ListingTypes } from '@src/types/listingTypes';
import { denormalisedResponseEntities, Listing, User } from '@utils/data';
import { convertWeekDay, getDaySessionFromDeliveryTime } from '@utils/dates';
import type { TListing, TUser } from '@utils/types';
import uniq from 'lodash/uniq';
import { DateTime } from 'luxon';

import { orderAsyncActions } from './Order.slice';

// ================ Initial states ================ //
type TKeyValue<T = string> = {
  key: string;
  label: T;
};

type TBookerDraftOrderPageState = {
  menuTypes: TKeyValue[];
  categories: TKeyValue[];
  restaurantIdList: string[];
  companyFromOrder: TUser | null;
  searchResult: TListing[];
  totalItems: number;
  totalRatings: {
    restaurantId: string;
    totalReviews: number;
  }[];

  fetchFilterInProgress: boolean;
  searchInProgress: boolean;

  fetchCompanyFromOrderInProgress: boolean;
  fetchCompanyFromOrderError: any;
};
const initialState: TBookerDraftOrderPageState = {
  menuTypes: [],
  categories: [],
  restaurantIdList: [],
  companyFromOrder: null,

  searchResult: [],
  totalItems: 0,
  totalRatings: [],

  fetchFilterInProgress: false,
  searchInProgress: false,

  fetchCompanyFromOrderInProgress: false,
  fetchCompanyFromOrderError: null,
};

// ================ Thunk types ================ //
const FETCH_SEARCH_FILTER = 'app/BookerDraftOrderPage/FETCH_SEARCH_FILTER';
const SEARCH_RESTAURANT = 'app/BookerDraftOrderPage/SEARCH_RESTAURANT';
const FETCH_COMPANY_FROM_ORDER =
  'app/BookerDraftOrderPage/FETCH_COMPANY_FROM_ORDER';

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
    const { restaurantIdList = [], companyFromOrder } =
      getState().BookerDraftOrderPage;
    let newRestaurantIdList = [...restaurantIdList];

    const { deliveryHour, nutritions, packagePerMember } = Listing(
      order as TListing,
    ).getMetadata();
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
    newRestaurantIdList = uniq([
      ...allMenus.map(
        (menu: TListing) => Listing(menu).getMetadata()?.restaurantId,
      ),
    ]);

    const origin = User(companyFromOrder as TUser).getPublicData()?.location
      ?.origin;
    const bounds = distance ? calculateBounds(origin, distance) : '';

    const restaurantsResponse = await sdk.listings.query({
      ids: newRestaurantIdList.join(','),
      meta_rating: rating,
      keywords,
      page,
      ...(distance ? { bounds } : {}),
      include: ['images'],
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
      totalItems: meta.totalItems,
      totalRatings,
    };
  },
);

const fetchCompanyFromOrder = createAsyncThunk(
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
      companyFromOrder: companyAccount,
    };
  },
);

export const BookerDraftOrderPageThunks = {
  searchRestaurants,
  fetchSearchFilter,
  fetchCompanyFromOrder,
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
      })
      .addCase(searchRestaurants.rejected, (state) => {
        state.searchInProgress = false;
      })
      .addCase(fetchCompanyFromOrder.pending, (state) => {
        state.fetchCompanyFromOrderInProgress = true;
        state.fetchCompanyFromOrderError = null;
      })
      .addCase(fetchCompanyFromOrder.fulfilled, (state, action) => {
        state.companyFromOrder = action.payload.companyFromOrder;
        state.fetchCompanyFromOrderInProgress = false;
      })
      .addCase(fetchCompanyFromOrder.rejected, (state, { payload }) => {
        state.fetchCompanyFromOrderInProgress = false;
        state.fetchCompanyFromOrderError = payload;
      });
  },
});

// ================ Actions ================ //
export const BookerDraftOrderPageActions = BookerDraftOrderPageSlice.actions;
export default BookerDraftOrderPageSlice.reducer;

// ================ Selectors ================ //
