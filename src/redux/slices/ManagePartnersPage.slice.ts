/* eslint-disable import/no-cycle */

import type { ThunkAPI } from '@redux/store';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { queryRestaurantListingsApi } from '@utils/api';
import { denormalisedResponseEntities } from '@utils/data';
import { EListingType, ERestaurantListingState } from '@utils/enums';
import { storableError } from '@utils/errors';
import type { TPagination } from '@utils/types';

const RESULT_PAGE_SIZE = 10;

interface ManageParnersState {
  restaurantRefs: any[];
  queryRestaurantsInProgress: boolean;
  queryRestaurantsError: any;
  pagination: TPagination;
}

const QUERY_RESTAURANTS = 'app/ManagePartnersPage/QUERY_RESTAURANTS';

const queryRestaurants = createAsyncThunk(
  QUERY_RESTAURANTS,
  async (params: any, { fulfillWithValue, rejectWithValue }: ThunkAPI) => {
    try {
      const dataParams = {
        ...params,
        meta_listingState: [
          ERestaurantListingState.draft,
          ERestaurantListingState.published,
        ],
        meta_listingType: EListingType.restaurant,
        perPage: RESULT_PAGE_SIZE,
        include: ['author'],
        'fields.listing': [
          'title',
          'geolocation',
          'price',
          'publicData',
          'metadata',
        ],
      };
      const { data } = await queryRestaurantListingsApi({
        dataParams,
        queryParams: { expand: true },
      });
      const restaurantRefs = denormalisedResponseEntities(data);
      return fulfillWithValue({ restaurantRefs, response: data });
    } catch (error: any) {
      console.error('Query company error : ', error);
      return rejectWithValue(storableError(error.response.data));
    }
  },
);

export const managePartnerThunks = {
  queryRestaurants,
};

const initialState: ManageParnersState = {
  restaurantRefs: [],
  queryRestaurantsInProgress: false,
  queryRestaurantsError: true,
  pagination: {
    totalItems: 0,
    totalPages: 0,
    page: 0,
    perPage: 0,
  },
};

export const managePartnersSlice = createSlice({
  name: 'ManagePartnersPage',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(queryRestaurants.pending, (state) => ({
        ...state,
        queryRestaurantsError: null,
        queryRestaurantsInProgress: true,
      }))
      .addCase(queryRestaurants.fulfilled, (state, action) => {
        const { restaurantRefs, response } = action.payload || {};
        return {
          ...state,
          restaurantRefs,
          queryRestaurantsInProgress: false,
          pagination: response.data.meta,
        };
      })
      .addCase(queryRestaurants.rejected, (state, action) => ({
        ...state,
        queryRestaurantsError: action.payload,
        queryRestaurantsInProgress: false,
      }));
  },
});

export default managePartnersSlice.reducer;
