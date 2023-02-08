import { createAsyncThunk } from '@redux/redux.helper';
import { createSlice } from '@reduxjs/toolkit';
import { ListingTypes } from '@src/types/listingTypes';
import { denormalisedResponseEntities, LISTING } from '@utils/data';
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
};

// ================ Thunk types ================ //
const QUERY_RESTAURANTS = 'app/SelectRestaurantPage/QUERY_RESTAURANTS';
const QUERY_RESTAURANT_FOOD = 'app/SelectRestaurantPage/QUERY_RESTAURANT_FOOD';

// ================ Thunks ================ //
const getRestaurants = createAsyncThunk(
  QUERY_RESTAURANTS,
  async (params: TObject | undefined, { extra: sdk }) => {
    const queryParams: TObject = {};

    if (params) {
      queryParams.keywords = params.title;
    }
    const { dateTime } = params || {};
    const dayOfWeek = convertWeekDay(dateTime.weekday).key;
    const response = await sdk.listings.query({
      meta_listingType: ListingTypes.MENU,
      pub_startDate: `,${dateTime.toMillis()}`,
      pub_daysOfWeek: `has_any:${dayOfWeek}`,
    });

    const { meta } = response?.data || {};

    const menuList = denormalisedResponseEntities(response);
    const restaurantList = await Promise.all(
      menuList.map(async (menu: TListing) => {
        const { restaurantId } = LISTING(menu).getMetadata();
        const restaurantResponse = await sdk.listings.show({
          id: restaurantId,
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
  async (restaurantId: string, { extra: sdk }) => {
    const response = await sdk.listings.query({
      meta_restaurantId: restaurantId,
      meta_listingType: ListingTypes.FOOD,
    });
    const result = denormalisedResponseEntities(response);
    return { foodOfRestaurant: restaurantId, foodList: result };
  },
);

export const selectRestaurantPageThunks = {
  getRestaurants,
  getRestaurantFood,
};

const SelectRestaurantPageSlice = createSlice({
  name: 'SelectRestaurantPage',
  initialState,
  reducers: {},
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
        state.foodOfRestaurant = payload.foodOfRestaurant;
      })
      .addCase(getRestaurantFood.rejected, (state, { error }) => {
        state.fetchFoodPending = false;
        state.fetchFoodError = error;
        state.foodList = [];
      });
  },
});

export default SelectRestaurantPageSlice.reducer;
