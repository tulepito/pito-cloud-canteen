/* eslint-disable import/no-cycle */

import type { ThunkAPI } from '@redux/store';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  deletePartnerApi,
  queryRestaurantListingsApi,
  updateRestaurantStatusApi,
} from '@utils/api';
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
  restaurantTableActionInProgress: any;
  restaurantTableActionError: any;
}

const QUERY_RESTAURANTS = 'app/ManagePartnersPage/QUERY_RESTAURANTS';

const SET_RESTAURANT_STATUS = 'app/ManagePartnersPage/SET_RESTAURANT_STATUS';

const DELETE_RESTAURANT = 'app/ManagePartnersPage/DELETE_RESTAURANT';

const setRestaurantStatus = createAsyncThunk(
  SET_RESTAURANT_STATUS,
  async (params: any, { fulfillWithValue, rejectWithValue }: ThunkAPI) => {
    try {
      const response = await updateRestaurantStatusApi({
        dataParams: params,
      });
      return fulfillWithValue(response);
    } catch (error: any) {
      console.error('Query company error : ', error);
      return rejectWithValue(storableError(error.response.data));
    }
  },
);

const deleteRestaurant = createAsyncThunk(
  DELETE_RESTAURANT,
  async (params: any, { fulfillWithValue, rejectWithValue }: ThunkAPI) => {
    try {
      const { partnerId: id } = params;
      const { data } = await deletePartnerApi({ id });
      return fulfillWithValue(data);
    } catch (error) {
      console.log('error', error);
      return rejectWithValue(storableError(error));
    }
  },
);

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
  setRestaurantStatus,
  deleteRestaurant,
};

const initialState: ManageParnersState = {
  restaurantRefs: [],
  queryRestaurantsInProgress: false,
  queryRestaurantsError: null,
  pagination: {
    totalItems: 0,
    totalPages: 0,
    page: 0,
    perPage: 0,
  },
  restaurantTableActionInProgress: null,
  restaurantTableActionError: null,
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
      }))
      .addCase(setRestaurantStatus.pending, (state, action) => {
        return {
          ...state,
          restaurantTableActionInProgress: action.meta.arg.id,
          restaurantTableActionError: null,
        };
      })
      .addCase(setRestaurantStatus.fulfilled, (state) => ({
        ...state,
        restaurantTableActionInProgress: null,
      }))
      .addCase(setRestaurantStatus.rejected, (state, action) => ({
        ...state,
        restaurantTableActionInProgress: null,
        restaurantTableActionError: action.payload,
      }))
      .addCase(deleteRestaurant.pending, (state, action) => {
        return {
          ...state,
          restaurantTableActionInProgress: action.meta.arg.restaurantId,
          restaurantTableActionError: null,
        };
      })
      .addCase(deleteRestaurant.fulfilled, (state) => ({
        ...state,
        restaurantTableActionInProgress: null,
      }))
      .addCase(deleteRestaurant.rejected, (state, action) => ({
        ...state,
        restaurantTableActionInProgress: null,
        restaurantTableActionError: action.payload,
      }));
  },
});

export default managePartnersSlice.reducer;
