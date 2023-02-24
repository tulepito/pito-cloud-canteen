import { fetchSearchFilterApi } from '@apis/userApi';
import { LISTING_TYPE } from '@pages/api/helpers/constants';
import { createAsyncThunk } from '@redux/redux.helper';
import { createSlice } from '@reduxjs/toolkit';
import { denormalisedResponseEntities } from '@utils/data';
import {
  EImageVariants,
  ERestaurantListingState,
  ERestaurantListingStatus,
} from '@utils/enums';
import type { TObject } from '@utils/types';

// ================ Initial states ================ //
type TKeyValue<T = string> = {
  key: string;
  label: T;
};

type TQuizState = {
  quiz: TObject;
  categories: TKeyValue[];
  fetchFilterInProgress: boolean;
};
const initialState: TQuizState = {
  quiz: {},
  categories: [],
  fetchFilterInProgress: false,
};

// ================ Thunk types ================ //
const FETCH_SEARCH_FILTER = 'app/Quiz/FETCH_SEARCH_FILTER';
const FETCH_RESTAURANTS = 'app/Quiz/FETCH_RESTAURANTS';

// ================ Async thunks ================ //
const fetchSearchFilter = createAsyncThunk(FETCH_SEARCH_FILTER, async () => {
  const { data: searchFiltersResponse } = await fetchSearchFilterApi();
  return searchFiltersResponse.categories;
});

const fetchRestaurants = createAsyncThunk(
  FETCH_RESTAURANTS,
  async (_, { extra: sdk }) => {
    const query = {
      meta_listingType: LISTING_TYPE.RESTAURANT,
      meta_status: ERestaurantListingStatus.authorized,
      meta_listingState: ERestaurantListingState.published,
      include: ['images'],
      'fields.image': [
        `variants.${EImageVariants.default}`,
        `variants.${EImageVariants.squareSmall}`,
        `variants.${EImageVariants.landscapeCrop}`,
        `variants.${EImageVariants.landscapeCrop2x}`,
      ],
    };
    const restaurants = denormalisedResponseEntities(
      await sdk.listings.query(query),
    );
    return restaurants;
  },
);
export const QuizThunks = {
  fetchSearchFilter,
  fetchRestaurants,
};

// ================ Slice ================ //
const QuizSlice = createSlice({
  name: 'Quiz',
  initialState,
  reducers: {
    updateQuiz: (state, { payload }) => ({
      ...state,
      quiz: {
        ...state.quiz,
        ...payload,
      },
    }),
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSearchFilter.pending, (state) => {
        state.fetchFilterInProgress = true;
      })
      .addCase(fetchSearchFilter.fulfilled, (state, action) => {
        state.fetchFilterInProgress = false;
        state.categories = action.payload;
      });
  },
});

// ================ Actions ================ //
export const QuizActions = QuizSlice.actions;
export default QuizSlice.reducer;

// ================ Selectors ================ //
