import { createAsyncThunk } from '@redux/redux.helper';
import { createSlice } from '@reduxjs/toolkit';
import { denormalisedResponseEntities } from '@utils/data';
import type { TPagination } from '@utils/types';

type TSelectRestaurantPageSliceInitialState = {
  restaurants: any[] | null;
  pagination: TPagination | null;
  selectRestaurantPageError: any;
};

const initialState: TSelectRestaurantPageSliceInitialState = {
  restaurants: null,
  pagination: null,
  selectRestaurantPageError: null,
};

// ================ Thunk types ================ //
const QUERY_RESTAURANTS = 'app/SelectRestaurantPage/QUERY_RESTAURANTS';

// ================ Thunks ================ //
const getRestaurants = createAsyncThunk(
  QUERY_RESTAURANTS,
  async (params: Record<string, any> | undefined, { extra: sdk }) => {
    const response = await sdk.listings.query({
      ...params,
      meta_listingType: 'restaurant',
    });
    const { meta } = response?.data || {};
    const entities = denormalisedResponseEntities(response);

    return { restaurants: entities, pagination: meta };
  },
);

export const selectRestaurantPageThunks = {
  getRestaurants,
};

const SelectRestaurantPageSlice = createSlice({
  name: 'SelectRestaurantPage',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getRestaurants.pending, (state) => {
        return { ...state, selectRestaurantPageError: null };
      })
      .addCase(getRestaurants.fulfilled, (state, { payload }) => {
        const { pagination, restaurants } = payload;
        state.restaurants = restaurants;
        state.pagination = pagination;
      })
      .addCase(getRestaurants.rejected, (state, { error }) => {
        return { ...state, selectRestaurantPageError: error };
      });
  },
});

export default SelectRestaurantPageSlice.reducer;
