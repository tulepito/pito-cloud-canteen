import { createAsyncThunk } from '@redux/redux.helper';
import { createSlice } from '@reduxjs/toolkit';
import { ListingTypes } from '@src/types/listingTypes';
import { denormalisedResponseEntities } from '@utils/data';
import type { TListing } from '@utils/types';

// ================ Initial states ================ //
type TNutritionState = {
  restaurantFoodList: {
    [restaurantId: string]: TListing[];
  };
  fetchFoodFromRestaurantInProgress: boolean;
  fetchFoodFromRestaurantError: any;

  selectedRestaurant: TListing | null;
  fetchSelectedRestaurantInProgress: boolean;
  fetchSelectedRestaurantError: any;

  restaurantTotalRating: number;
  restaurantTotalRatingInProgress: boolean;
  restaurantTotalRatingError: any;

  searchFoodInRestaurantInProgress: boolean;
  searchFoodInRestaurantError: any;
};
const initialState: TNutritionState = {
  selectedRestaurant: null,
  fetchSelectedRestaurantInProgress: false,
  fetchSelectedRestaurantError: null,

  restaurantFoodList: {},
  fetchFoodFromRestaurantInProgress: false,
  fetchFoodFromRestaurantError: null,

  restaurantTotalRating: 0,
  restaurantTotalRatingInProgress: false,
  restaurantTotalRatingError: null,

  searchFoodInRestaurantInProgress: false,
  searchFoodInRestaurantError: null,
};

// ================ Thunk types ================ //
const FETCH_SELECTED_RESTAURANT =
  'app/SelectRestaurantPage/FETCH_SELECTED_RESTAURANT';
const FETCH_FOOD_FROM_RESTAURANT =
  'app/SelectRestaurantPage/FETCH_FOOD_FROM_RESTAURANT';
const FETCH_TOTAL_RATING = 'app/SelectRestaurantPage/FETCH_TOTAL_RATING';
const SEARCH_FOOD_IN_RESTAURANT =
  'app/SelectRestaurantPage/SEARCH_FOOD_IN_RESTAURANT';

// ================ Async thunks ================ //
const fetchSelectedRestaurant = createAsyncThunk(
  FETCH_SELECTED_RESTAURANT,
  async (restaurantId: string, { extra: sdk }) => {
    const response = await sdk.listings.show({
      id: restaurantId,
      include: ['images'],
      'fields.image': [
        'variants.landscape-crop',
        'variants.landscape-crop2x',
        'variants.square-small',
        'variants.square-small2x',
      ],
    });
    return denormalisedResponseEntities(response)[0];
  },
);

const fetchFoodFromRestaurant = createAsyncThunk(
  FETCH_FOOD_FROM_RESTAURANT,
  async (restaurantId: string, { extra: sdk, getState }) => {
    const { restaurantFoodList = {} } = getState().Nutrition;
    const response = await sdk.listings.query({
      meta_listingType: ListingTypes.FOOD,
      meta_restaurantId: restaurantId,
      include: ['images'],
      'fields.image': ['variants.default'],
    });
    const result = denormalisedResponseEntities(response);
    const newRestaurantFoodList = {
      ...restaurantFoodList,
      [restaurantId]: result,
    };
    return newRestaurantFoodList;
  },
);

const fetchTotalRating = createAsyncThunk(
  FETCH_TOTAL_RATING,
  async (restaurantId: string, { extra: sdk }) => {
    const response = await sdk.reviews.query({
      listingId: restaurantId,
      type: 'ofCustomer',
    });
    const result = denormalisedResponseEntities(response);
    return result.length;
  },
);

const searchFoodInRestaurant = createAsyncThunk(
  SEARCH_FOOD_IN_RESTAURANT,
  async (params: any, { extra: sdk, getState }) => {
    const { restaurantFoodList = {} } = getState().Nutrition;
    const { restaurantId, keywords } = params;
    const response = await sdk.listings.query({
      meta_listingType: ListingTypes.FOOD,
      meta_restaurantId: restaurantId,
      include: ['images'],
      'fields.image': ['variants.default'],
      keywords,
    });
    const result = denormalisedResponseEntities(response);
    const newRestaurantFoodList = {
      ...restaurantFoodList,
      [restaurantId]: result,
    };
    return newRestaurantFoodList;
  },
);

export const NutritionThunks = {
  fetchSelectedRestaurant,
  fetchFoodFromRestaurant,
  fetchTotalRating,
  searchFoodInRestaurant,
};

// ================ Slice ================ //
const NutritionSlice = createSlice({
  name: 'Nutrition',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
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
      })

      .addCase(fetchFoodFromRestaurant.pending, (state) => {
        state.fetchFoodFromRestaurantInProgress = true;
        state.fetchFoodFromRestaurantError = null;
      })
      .addCase(fetchFoodFromRestaurant.fulfilled, (state, { payload }) => {
        state.fetchFoodFromRestaurantInProgress = false;
        state.restaurantFoodList = payload;
      })
      .addCase(fetchFoodFromRestaurant.rejected, (state, { error }) => {
        state.fetchFoodFromRestaurantInProgress = false;
        state.fetchFoodFromRestaurantError = error;
      })

      .addCase(fetchTotalRating.pending, (state) => {
        state.restaurantTotalRatingInProgress = true;
        state.restaurantTotalRatingError = null;
      })
      .addCase(fetchTotalRating.fulfilled, (state, { payload }) => {
        state.restaurantTotalRatingInProgress = false;
        state.restaurantTotalRating = payload;
      })
      .addCase(fetchTotalRating.rejected, (state, { error }) => {
        state.restaurantTotalRatingInProgress = false;
        state.restaurantTotalRatingError = error;
      })

      .addCase(searchFoodInRestaurant.pending, (state) => {
        state.searchFoodInRestaurantInProgress = true;
        state.searchFoodInRestaurantError = null;
      })
      .addCase(searchFoodInRestaurant.fulfilled, (state, { payload }) => {
        state.searchFoodInRestaurantInProgress = false;
        state.restaurantFoodList = payload;
      })
      .addCase(searchFoodInRestaurant.rejected, (state, { error }) => {
        state.searchFoodInRestaurantInProgress = false;
        state.searchFoodInRestaurantError = error;
      });
  },
});

// ================ Actions ================ //
export const NutritionActions = NutritionSlice.actions;
export default NutritionSlice.reducer;

// ================ Selectors ================ //
