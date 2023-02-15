import { fetchSearchFilterApi } from '@apis/userApi';
import { queryAllPages } from '@helpers/apiHelpers';
import { deliveryDaySessionAdapter } from '@helpers/orderHelper';
import { createAsyncThunk } from '@redux/redux.helper';
import { createSlice } from '@reduxjs/toolkit';
import { ListingTypes } from '@src/types/listingTypes';
import { denormalisedResponseEntities, Listing } from '@utils/data';
import { convertWeekDay, getDaySessionFromDeliveryTime } from '@utils/dates';
import type { TListing } from '@utils/types';
import { DateTime } from 'luxon';

// ================ Initial states ================ //
type TKeyValue<T = string> = {
  key: string;
  value: T;
};

type TSearchFilterState = {
  menuTypes: TKeyValue[];
  mealTypes: TKeyValue[];
  restaurantIdList: string[];

  searchResult: TListing[];

  fetchFilterInProgress: boolean;
};
const initialState: TSearchFilterState = {
  menuTypes: [],
  mealTypes: [],

  restaurantIdList: [],

  searchResult: [],

  fetchFilterInProgress: false,
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
  async (params: Record<string, any>, { extra: sdk, getState }) => {
    const {
      timestamp,
      favoriteRestaurantIdList = [],
      favoriteFoodIdList = [],
      rating = '',
      menuTypes = [],
      page = 1,
    } = params;
    const dateTime = DateTime.fromMillis(timestamp);
    const { order } = getState().Order;
    const { restaurantIdList = [], searchResult = [] } =
      getState().SearchFilter;
    let newRestaurantIdList = [...restaurantIdList];

    if (restaurantIdList.length === 0) {
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
        pub_mealTypes: `has_any:${mealType}`,

        ...(menuTypes.length > 0 ? { meta_menuType: menuTypes.join(',') } : {}),
        ...(nutritions.length > 0
          ? {
              [`meta_${dayOfWeek}Nutritions`]: `has_any:${nutritions.join(
                ',',
              )}`,
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
      newRestaurantIdList = [
        ...allMenus.map(
          (menu: TListing) => Listing(menu).getMetadata()?.restaurantId,
        ),
      ];
    }

    const restaurants = denormalisedResponseEntities(
      await sdk.listings.query({
        ids: newRestaurantIdList.join(','),
        meta_rating: rating,
        page,
      }),
    );

    return {
      ...(newRestaurantIdList.length > 0 && {
        restaurantIdList: newRestaurantIdList,
      }),
      searchResult: searchResult.concat(restaurants),
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
        state.mealTypes = action.payload.mealTypes;
      });
  },
});

// ================ Actions ================ //
export const SearchFilterActions = SearchFilterSlice.actions;
export default SearchFilterSlice.reducer;

// ================ Selectors ================ //
