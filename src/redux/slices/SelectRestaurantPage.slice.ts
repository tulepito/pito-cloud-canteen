import { createSlice } from '@reduxjs/toolkit';

import { getMenuQuery } from '@helpers/listingSearchQuery';
import { createAsyncThunk } from '@redux/redux.helper';
import { ListingTypes } from '@src/types/listingTypes';
import { denormalisedResponseEntities, Listing } from '@utils/data';
import { convertWeekDay } from '@utils/dates';
import type { TListing, TObject, TPagination } from '@utils/types';

type TSelectRestaurantPageSliceInitialState = {
  fetchRestaurantsPending: boolean;
  restaurants: any[] | null;
  pagination: TPagination | null;
  selectRestaurantPageError: any;

  foodOfRestaurant: string | null;
  foodList: any[];
  fetchFoodPending: boolean;
  fetchFoodError: any;

  selectedRestaurant: TListing | null;
  fetchSelectedRestaurantInProgress: boolean;
  fetchSelectedRestaurantError: any;
};

const initialState: TSelectRestaurantPageSliceInitialState = {
  fetchRestaurantsPending: false,
  restaurants: null,
  pagination: null,
  selectRestaurantPageError: null,
  foodOfRestaurant: null,
  foodList: [],
  fetchFoodPending: false,
  fetchFoodError: null,
  selectedRestaurant: null,
  fetchSelectedRestaurantInProgress: false,
  fetchSelectedRestaurantError: null,
};

// ================ Thunk types ================ //
const QUERY_RESTAURANTS = 'app/SelectRestaurantPage/QUERY_RESTAURANTS';
const QUERY_RESTAURANT_FOOD = 'app/SelectRestaurantPage/QUERY_RESTAURANT_FOOD';
const FETCH_SELECTED_RESTAURANT =
  'app/SelectRestaurantPage/FETCH_SELECTED_RESTAURANT';
// ================ Thunks ================ //
const getRestaurants = createAsyncThunk(
  QUERY_RESTAURANTS,
  async (params: TObject | undefined, { extra: sdk, getState }) => {
    const { order } = getState().Order;
    const {
      dateTime,
      favoriteRestaurantIdList = [],
      favoriteFoodIdList = [],
      title = '',
      page = 1,
      perPage = 10,
    } = params || {};
    const menuQuery = getMenuQuery({
      order,
      params: {
        favoriteRestaurantIdList,
        favoriteFoodIdList,
        page,
        perPage,
        timestamp: dateTime,
        keywords: title,
      },
    });
    const response = await sdk.listings.query(menuQuery);

    const { meta } = response?.data || {};

    const menuList = denormalisedResponseEntities(response);
    const restaurantList = await Promise.all(
      menuList.map(async (menu: TListing) => {
        const { restaurantId } = Listing(menu).getMetadata();
        const restaurantResponse = await sdk.listings.show({
          id: restaurantId,
          include: ['images'],
          'fields.image': [
            'variants.landscape-crop',
            'variants.landscape-crop2x',
          ],
        });

        return {
          restaurantInfo: denormalisedResponseEntities(restaurantResponse)[0],
          menu,
        };
      }),
    );

    return { restaurants: restaurantList, pagination: meta };
  },
);

const getRestaurantFood = createAsyncThunk(
  QUERY_RESTAURANT_FOOD,
  async (
    { menuId, dateTime, favoriteFoodIdList = [] }: any,
    { extra: sdk, getState },
  ) => {
    const { order } = getState().Order;
    const { packagePerMember, nutritions = [] } = Listing(
      order as TListing,
    ).getMetadata();
    const dayOfWeek = convertWeekDay(dateTime.weekday).key;
    const response = await sdk.listings.query({
      pub_menuIdList: `has_any:${menuId}`,
      meta_listingType: ListingTypes.FOOD,
      pub_menuWeekDay: `has_any:${dayOfWeek}`,
      price: `,${packagePerMember}`,
      ...(nutritions.length > 0
        ? { pub_specialDiets: `has_any:${nutritions.join(',')}` }
        : {}),
      ...(favoriteFoodIdList.length > 0
        ? {
            ids: favoriteFoodIdList.join(','),
          }
        : {}),
    });
    const result = denormalisedResponseEntities(response);

    return { foodList: result };
  },
);

const fetchSelectedRestaurant = createAsyncThunk(
  FETCH_SELECTED_RESTAURANT,
  async (restaurantId: string, { extra: sdk }) => {
    const response = await sdk.listings.show({
      id: restaurantId,
      include: ['images'],
      'fields.image': ['variants.landscape-crop', 'variants.landscape-crop2x'],
    });

    return denormalisedResponseEntities(response)[0];
  },
);

export const selectRestaurantPageThunks = {
  getRestaurants,
  getRestaurantFood,
  fetchSelectedRestaurant,
};

const SelectRestaurantPageSlice = createSlice({
  name: 'SelectRestaurantPage',
  initialState,
  reducers: {
    setSelectedRestaurant: (state, { payload }) => ({
      ...state,
      selectedRestaurant: payload,
    }),
  },
  extraReducers: (builder) => {
    builder
      .addCase(getRestaurants.pending, (state) => {
        return {
          ...state,
          fetchRestaurantsPending: true,
          selectRestaurantPageError: null,
        };
      })
      .addCase(getRestaurants.fulfilled, (state, { payload }) => {
        const { pagination, restaurants } = payload;
        state.restaurants = restaurants;
        state.pagination = pagination;
        state.fetchRestaurantsPending = false;
      })
      .addCase(getRestaurants.rejected, (state, { error }) => {
        return {
          ...state,
          selectRestaurantPageError: error,
          fetchRestaurantsPending: false,
        };
      })

      .addCase(getRestaurantFood.pending, (state) => {
        state.fetchFoodPending = true;
        state.fetchFoodError = null;
        state.foodList = [];
      })
      .addCase(getRestaurantFood.fulfilled, (state, { payload }) => {
        state.fetchFoodPending = false;
        state.foodList = payload.foodList;
      })
      .addCase(getRestaurantFood.rejected, (state, { error }) => {
        state.fetchFoodPending = false;
        state.fetchFoodError = error;
        state.foodList = [];
      })

      .addCase(fetchSelectedRestaurant.pending, (state) => {
        state.fetchSelectedRestaurantInProgress = true;
        state.fetchSelectedRestaurantError = null;
      })
      .addCase(fetchSelectedRestaurant.fulfilled, (state, { payload }) => {
        state.fetchSelectedRestaurantInProgress = false;
        state.selectedRestaurant = payload;
      })
      .addCase(fetchSelectedRestaurant.rejected, (state, { error }) => {
        state.fetchSelectedRestaurantInProgress = false;
        state.fetchSelectedRestaurantError = error;
      });
  },
});

export const { setSelectedRestaurant } = SelectRestaurantPageSlice.actions;

export default SelectRestaurantPageSlice.reducer;
