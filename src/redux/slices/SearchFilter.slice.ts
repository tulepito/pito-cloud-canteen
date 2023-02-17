import { fetchSearchFilterApi } from '@apis/userApi';
import { queryAllPages } from '@helpers/apiHelpers';
import { deliveryDaySessionAdapter } from '@helpers/orderHelper';
import { createAsyncThunk } from '@redux/redux.helper';
import { createSlice } from '@reduxjs/toolkit';
import { ListingTypes } from '@src/types/listingTypes';
import { denormalisedResponseEntities, Listing } from '@utils/data';
import { convertWeekDay, getDaySessionFromDeliveryTime } from '@utils/dates';
import type { TListing } from '@utils/types';
import uniq from 'lodash/uniq';
import { DateTime } from 'luxon';

import { orderAsyncActions } from './Order.slice';

// ================ Initial states ================ //
type TKeyValue<T = string> = {
  key: string;
  label: T;
};

type TSearchFilterState = {
  menuTypes: TKeyValue[];
  categories: TKeyValue[];
  restaurantIdList: string[];

  searchResult: TListing[];
  totalItems: number;

  fetchFilterInProgress: boolean;
  searchInProgress: boolean;
};
const initialState: TSearchFilterState = {
  menuTypes: [],
  categories: [],

  restaurantIdList: [],

  searchResult: [],
  totalItems: 0,

  fetchFilterInProgress: false,
  searchInProgress: false,
};

// ================ Thunk types ================ //
const FETCH_SEARCH_FILTER = 'app/SearchFilter/FETCH_SEARCH_FILTER';
const SEARCH_RESTAURANT = 'app/SearchFilter/SEARCH_RESTAURANT';

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
    } = params;
    await dispatch(orderAsyncActions.fetchOrder(orderId));
    const dateTime = DateTime.fromMillis(timestamp);
    const { order } = getState().Order;
    const { restaurantIdList = [] } = getState().SearchFilter;
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

    const restaurantsResponse = await sdk.listings.query({
      ids: newRestaurantIdList.join(','),
      meta_rating: rating,
      keywords,
      page,
    });

    const { meta } = restaurantsResponse.data;

    const restaurants = denormalisedResponseEntities(restaurantsResponse);

    return {
      ...(newRestaurantIdList.length > 0 && {
        restaurantIdList: newRestaurantIdList,
      }),
      searchResult: restaurants,
      totalItems: meta.totalItems,
    };
  },
);

export const SearchFilterThunks = {
  searchRestaurants,
  fetchSearchFilter,
};

// ================ Slice ================ //
const SearchFilterSlice = createSlice({
  name: 'SearchFilter',
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
      })
      .addCase(searchRestaurants.rejected, (state) => {
        state.searchInProgress = false;
      });
  },
});

// ================ Actions ================ //
export const SearchFilterActions = SearchFilterSlice.actions;
export default SearchFilterSlice.reducer;

// ================ Selectors ================ //
