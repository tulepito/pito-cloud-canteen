import { createSlice } from '@reduxjs/toolkit';

import { queryOrdersApi } from '@apis/companyApi';
import { fetchUserApi } from '@apis/index';
import { createAsyncThunk } from '@redux/redux.helper';
import { denormalisedResponseEntities } from '@utils/data';
import {
  EImageVariants,
  EListingStates,
  EListingType,
  EOrderStates,
  ERestaurantListingStatus,
} from '@utils/enums';
import type { TListing, TObject, TUser } from '@utils/types';

// ================ Initial states ================ //

type TQuizState = {
  selectedCompany: TUser;
  fetchSelectedCompanyInProgress: boolean;
  fetchSelectedCompanyError: any;

  quiz: TObject;

  restaurants: TListing[];
  fetchRestaurantsInProgress: boolean;
  fetchRestaurantsError: any;

  allowCreateOrder: boolean;
  quizFlowOpen: boolean;
  previousOrder: TListing;
  fetchCompanyOrdersInProgress: boolean;
  fetchCompanyOrdersError: any;
  isCopyPreviousOrder: boolean;
  reorderOpen: boolean;
};
const initialState: TQuizState = {
  selectedCompany: null!,
  fetchSelectedCompanyInProgress: false,
  fetchSelectedCompanyError: null,
  quiz: {},

  restaurants: [],
  fetchRestaurantsInProgress: false,
  fetchRestaurantsError: null,

  allowCreateOrder: false,
  quizFlowOpen: false,
  previousOrder: null!,
  fetchCompanyOrdersInProgress: false,
  fetchCompanyOrdersError: null,
  isCopyPreviousOrder: false,
  reorderOpen: false,
};

// ================ Thunk types ================ //
const FETCH_RESTAURANTS = 'app/Quiz/FETCH_RESTAURANTS';
const FETCH_SELECTED_COMPANY = 'app/Quiz/FETCH_SELECTED_COMPANY';
const QUERY_COMPANY_ORDERS = 'app/Quiz/queryCompanyOrders';

// ================ Async thunks ================ //
const fetchRestaurants = createAsyncThunk(
  FETCH_RESTAURANTS,
  async (_, { extra: sdk }) => {
    const query = {
      meta_listingType: EListingType.subOrder,
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

const queryCompanyOrders = createAsyncThunk(
  QUERY_COMPANY_ORDERS,
  async (companyId: string) => {
    const apiBody = {
      dataParams: {
        meta_orderState: [
          EOrderStates.picking,
          EOrderStates.inProgress,
          EOrderStates.pendingPayment,
          EOrderStates.completed,
        ],
        meta_companyId: companyId,
      },
    };
    const { data: ordersResponse } = await queryOrdersApi(companyId, apiBody);

    const orders = denormalisedResponseEntities(ordersResponse);
    if (orders.length === 0) {
      return null;
    }

    return orders[0];
  },
);

export const QuizThunks = {
  fetchRestaurants,
  fetchSelectedCompany,
  queryCompanyOrders,
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
      state.isCopyPreviousOrder = false;
    },
    allowCreateOrder: (state) => {
      state.allowCreateOrder = true;
    },
    disallowCreateOrder: (state) => {
      state.allowCreateOrder = false;
    },
    openQuizFlow: (state) => {
      state.quizFlowOpen = true;
    },
    closeQuizFlow: (state) => {
      state.quizFlowOpen = false;
    },
    copyPreviousOrder: (state) => {
      state.isCopyPreviousOrder = true;
    },
    clearPreviousOrder: (state) => {
      state.isCopyPreviousOrder = false;
    },
    openReorder: (state) => {
      state.reorderOpen = true;
    },
    closeReorder: (state) => {
      state.reorderOpen = false;
    },
    setSelectedCompany: (state, { payload }) => {
      state.selectedCompany = payload;
    },
    setPreviousOrder: (state, { payload }) => {
      state.previousOrder = payload;
    },
  },
  extraReducers: (builder) => {
    builder
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
      })

      .addCase(queryCompanyOrders.pending, (state) => {
        state.fetchCompanyOrdersInProgress = true;
        state.fetchCompanyOrdersError = null;
      })
      .addCase(queryCompanyOrders.fulfilled, (state, { payload }) => {
        state.fetchCompanyOrdersInProgress = false;
        state.previousOrder = payload;
      })
      .addCase(queryCompanyOrders.rejected, (state, { error }) => {
        state.fetchCompanyOrdersInProgress = false;
        state.fetchCompanyOrdersError = error.message;
      });
  },
});

// ================ Actions ================ //
export const QuizActions = QuizSlice.actions;
export default QuizSlice.reducer;

// ================ Selectors ================ //
