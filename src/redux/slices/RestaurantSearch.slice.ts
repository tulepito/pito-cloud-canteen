import { createAsyncThunk } from '@redux/redux.helper';
import { createSlice } from '@reduxjs/toolkit';
import { ListingTypes } from '@src/types/listingTypes';
import { denormalisedResponseEntities } from '@utils/data';
import type { TListing, TObject, TPagination } from '@utils/types';

const RESTAURANT_PER_PAGE = 10;
const SEARCH_RESTAURANT = 'app/RestaurantSearch/SEARCH_RESTAURANT';

type RestaurantSearchInitialState = {
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

const initialState: RestaurantSearchInitialState = {
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
      meta_listingType: ListingTypes.RESTAURANT,
    };
    const response = await sdk.listings.query(searchParams);
    const { meta } = response.data;
    const results = denormalisedResponseEntities(response);
    return {
      pagination: meta,
      results,
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
