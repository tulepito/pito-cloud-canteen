import { createSlice } from '@reduxjs/toolkit';

import { fetchUserApi } from '@apis/index';
import { fetchSearchFilterApi } from '@apis/userApi';
import { LISTING_TYPE } from '@pages/api/helpers/constants';
import { createAsyncThunk } from '@redux/redux.helper';
import { denormalisedResponseEntities } from '@utils/data';
import {
  EImageVariants,
  EListingStates,
  ERestaurantListingStatus,
} from '@utils/enums';
import type { TListing, TObject, TUser } from '@utils/types';

// ================ Initial states ================ //
type TKeyValue<T = string> = {
  key: string;
  label: T;
};

type TQuizState = {
  selectedCompany: TUser;
  fetchSelectedCompanyInProgress: boolean;
  fetchSelectedCompanyError: any;

  quiz: TObject;
  categories: TKeyValue[];
  nutritions: TKeyValue[];
  fetchFilterInProgress: boolean;

  restaurants: TListing[];
  fetchRestaurantsInProgress: boolean;
  fetchRestaurantsError: any;

  allowCreateOrder: boolean;
};
const initialState: TQuizState = {
  selectedCompany: null!,
  fetchSelectedCompanyInProgress: false,
  fetchSelectedCompanyError: null,
  quiz: {},
  categories: [],
  nutritions: [],
  fetchFilterInProgress: false,
  restaurants: [],
  fetchRestaurantsInProgress: false,
  fetchRestaurantsError: null,

  allowCreateOrder: false,
};

// ================ Thunk types ================ //
const FETCH_SEARCH_FILTER = 'app/Quiz/FETCH_SEARCH_FILTER';
const FETCH_RESTAURANTS = 'app/Quiz/FETCH_RESTAURANTS';
const FETCH_SELECTED_COMPANY = 'app/Quiz/FETCH_SELECTED_COMPANY';

// ================ Async thunks ================ //
const fetchSearchFilter = createAsyncThunk(FETCH_SEARCH_FILTER, async () => {
  const { data: searchFiltersResponse } = await fetchSearchFilterApi();
  return searchFiltersResponse;
});

const fetchRestaurants = createAsyncThunk(
  FETCH_RESTAURANTS,
  async (_, { extra: sdk }) => {
    const query = {
      meta_listingType: LISTING_TYPE.RESTAURANT,
      meta_status: ERestaurantListingStatus.authorized,
      meta_listingState: EListingStates.published,
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

const fetchSelectedCompany = createAsyncThunk(
  FETCH_SELECTED_COMPANY,
  async (companyId: string) => {
    const { data: companyAccount } = await fetchUserApi(companyId);
    return companyAccount;
  },
);
export const QuizThunks = {
  fetchSearchFilter,
  fetchRestaurants,
  fetchSelectedCompany,
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
    clearQuizData: (state) => {
      state.quiz = {};
    },
    allowCreateOrder: (state) => {
      state.allowCreateOrder = true;
    },
    disallowCreateOrder: (state) => {
      state.allowCreateOrder = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSearchFilter.pending, (state) => {
        state.fetchFilterInProgress = true;
      })
      .addCase(fetchSearchFilter.fulfilled, (state, action) => {
        state.fetchFilterInProgress = false;
        state.categories = action.payload.categories;
        state.nutritions = action.payload.nutritions;
      })

      .addCase(fetchRestaurants.pending, (state) => {
        state.fetchRestaurantsInProgress = true;
        state.fetchRestaurantsError = null;
      })
      .addCase(fetchRestaurants.fulfilled, (state, { payload }) => {
        state.fetchRestaurantsInProgress = false;
        state.restaurants = payload;
      })
      .addCase(fetchRestaurants.rejected, (state, { error }) => {
        state.fetchRestaurantsInProgress = false;
        state.fetchRestaurantsError = error.message;
      })

      .addCase(fetchSelectedCompany.pending, (state) => {
        state.fetchSelectedCompanyInProgress = true;
        state.fetchSelectedCompanyError = null;
      })
      .addCase(fetchSelectedCompany.fulfilled, (state, { payload }) => {
        state.fetchSelectedCompanyInProgress = false;
        state.selectedCompany = payload;
      })
      .addCase(fetchSelectedCompany.rejected, (state, { error }) => {
        state.fetchSelectedCompanyInProgress = false;
        state.fetchSelectedCompanyError = error.message;
      });
  },
});

// ================ Actions ================ //
export const QuizActions = QuizSlice.actions;
export default QuizSlice.reducer;

// ================ Selectors ================ //
