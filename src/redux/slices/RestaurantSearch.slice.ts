import { createSlice } from '@reduxjs/toolkit';

import { createAsyncThunk } from '@redux/redux.helper';
import { EListingType } from '@src/utils/enums';
import { denormalisedResponseEntities } from '@utils/data';
import type { TListing, TObject, TPagination } from '@utils/types';

const RESTAURANT_PER_PAGE = 10;
const SEARCH_RESTAURANT = 'app/RestaurantSearch/SEARCH_RESTAURANT';

type TRestaurantSearchInitialState = {
  pagination: TPagination | null;
  searchParams: TObject | null;
  searchInProgress: boolean;
  searchError: any;
  searchResults: TListing[];
};

type SearchParams = {
  keywords?: string;
  page: number;
  perPage: number;
};

const initialState: TRestaurantSearchInitialState = {
  pagination: null,
  searchParams: null,
  searchInProgress: false,
  searchError: null,
  searchResults: [],
};

const searchRestaurant = createAsyncThunk(
  SEARCH_RESTAURANT,
  async (
    { page = 1, perPage = RESTAURANT_PER_PAGE, ...rest }: SearchParams,
    { extra: sdk },
  ) => {
    const searchParams = {
      ...rest,
      page,
      perPage,
      meta_listingType: EListingType.restaurant,
    };
    const response = await sdk.listings.query(searchParams);

    return {
      pagination: response?.data?.meta,
      results: denormalisedResponseEntities(response),
    };
  },
);

export const RestaurantSearchAction = {
  searchRestaurant,
};

const RestaurantSearch = createSlice({
  name: 'RestaurantSearch',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(searchRestaurant.pending, (state) => ({
        ...state,
        searchInProgress: true,
        searchError: null,
      }))
      .addCase(searchRestaurant.fulfilled, (state, { payload }) => ({
        ...state,
        searchInProgress: false,
        pagination: payload.pagination,
        searchResults: payload.results,
      }))
      .addCase(searchRestaurant.rejected, (state, { error }) => ({
        ...state,
        searchInProgress: false,
        searchError: error.message,
      }));
  },
});

export default RestaurantSearch.reducer;
