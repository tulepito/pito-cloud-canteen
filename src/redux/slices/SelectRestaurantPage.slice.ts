import { createAsyncThunk } from '@redux/redux.helper';
import { createSlice } from '@reduxjs/toolkit';
import { denormalisedResponseEntities } from '@utils/data';
import type { TObject, TPagination } from '@utils/types';
import get from 'lodash/get';

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
    const response = await sdk.listings.query({
      ...queryParams,
      meta_listingType: 'restaurant',
    });
    const { meta } = response?.data || {};
    const entities = denormalisedResponseEntities(response);

    return { restaurants: entities, pagination: meta };
  },
);

const getRestaurantFood = createAsyncThunk(
  QUERY_RESTAURANT_FOOD,
  async (restaurantId: string, { extra: sdk, getState }) => {
    const restaurant = getState().SelectRestaurantPage.restaurants?.find(
      (rest) => rest?.id?.uuid === restaurantId,
    );
    const foodIds = get(restaurant, 'attributes.metadata.foods', []);
    const promises = foodIds.map(async (foodId: string) => {
      const response = await sdk.listings.show({ id: foodId });
      const [food] = denormalisedResponseEntities(response);
      return food;
    });
    const result = await Promise.all(promises);

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
