import { createSlice } from '@reduxjs/toolkit';

import { fetchReviewApi, fetchReviewDetailApi } from '@apis/partnerApi';
import { createAsyncThunk } from '@redux/redux.helper';
import type { TReviewDetail, TTotalRating } from '@src/types/partnerReviews';
import type { TObject } from '@src/utils/types';

// ================ Initial states ================ //
type TManageReviewsState = {
  isFirstLoad: boolean;
  fetchReviewDetailDatasInProgress: boolean;
  fetchReviewDetailDatasError: any;
  totalReviewDetailData: number;

  fetchReviewSummarizeDataInProgress: boolean;
  fetchReviewSummarizeDataError: any;
  ratingDetail: TTotalRating[];
  reviewDetailData: TReviewDetail[];
  averageFoodRating: number;
  averagePackagingRating: number;
  averageTotalRating: number;
  totalNumberOfReivews: number;
};
const initialState: TManageReviewsState = {
  isFirstLoad: true,
  fetchReviewDetailDatasInProgress: false,
  fetchReviewDetailDatasError: null,
  totalReviewDetailData: 0,

  fetchReviewSummarizeDataInProgress: false,
  fetchReviewSummarizeDataError: null,
  reviewDetailData: [],
  ratingDetail: [],
  averageFoodRating: 0,
  averagePackagingRating: 0,
  averageTotalRating: 0,
  totalNumberOfReivews: 0,
};

// ================ Thunk types ================ //

// ================ Async thunks ================ //
const loadData = createAsyncThunk(
  'app/ManageReviews/LOAD_DATA',
  async ({ page, pageSize, rating }: TObject) => {
    const response = await fetchReviewDetailApi(page, pageSize, rating);

    const { reviewDetailData, totalReviewDetailData } = response.data;

    return {
      reviewDetailData,
      totalReviewDetailData,
    };
  },
);
const loadReviewSummarizeData = createAsyncThunk(
  'app/ManageReviews/LOAD_REVIEW_SUMMARIZE_DATA',
  async () => {
    const response = await fetchReviewApi();

    const {
      totalNumberOfReivewsDetail,
      ratingDetail,
      averageFoodRating,
      averagePackagingRating,
      averageTotalRating,
      totalNumberOfReivews,
    } = response.data;

    return {
      totalNumberOfReivewsDetail,
      ratingDetail,

      averageFoodRating,
      averagePackagingRating,
      averageTotalRating,
      totalNumberOfReivews,
    };
  },
);

export const ManageReviewsThunks = {
  loadData,
  loadReviewSummarizeData,
};

// ================ Slice ================ //
const ManageReviewsSlice = createSlice({
  name: 'ManageReviews',
  initialState,
  reducers: {
    clearLoadedReviewSummarizeData: (state) => {
      state.averageFoodRating = 0;
      state.averagePackagingRating = 0;
      state.averageTotalRating = 0;
      state.totalNumberOfReivews = 0;
      state.ratingDetail = [];
    },
    clearLoadedReviewDetailData: (state) => {
      state.reviewDetailData = [];
      state.totalReviewDetailData = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      /* =============== loadData =============== */
      .addCase(loadData.pending, (state) => {
        state.fetchReviewDetailDatasInProgress = true;
        state.fetchReviewDetailDatasError = null;
      })
      .addCase(loadData.fulfilled, (state, { payload }) => {
        state.fetchReviewDetailDatasInProgress = false;
        state.reviewDetailData = payload.reviewDetailData;
        state.totalReviewDetailData = payload.totalReviewDetailData;
      })
      .addCase(loadData.rejected, (state, { error }) => {
        state.fetchReviewDetailDatasInProgress = false;
        state.fetchReviewDetailDatasError = error.message;
      })
      .addCase(loadReviewSummarizeData.pending, (state) => {
        state.fetchReviewSummarizeDataInProgress = true;
        state.fetchReviewSummarizeDataError = null;
      })

      .addCase(loadReviewSummarizeData.fulfilled, (state, { payload }) => {
        state.fetchReviewSummarizeDataInProgress = false;
        state.isFirstLoad = false;
        state.ratingDetail = payload.ratingDetail;
        state.averageFoodRating = payload.averageFoodRating;
        state.averagePackagingRating = payload.averagePackagingRating;
        state.averageTotalRating = payload.averageTotalRating;
        state.totalNumberOfReivews = payload.totalNumberOfReivews;
      })
      .addCase(loadReviewSummarizeData.rejected, (state, { error }) => {
        state.fetchReviewSummarizeDataInProgress = false;
        state.fetchReviewSummarizeDataError = error.message;
      });
  },
});

// ================ Actions ================ //
export const ManageReviewsActions = ManageReviewsSlice.actions;
export default ManageReviewsSlice.reducer;

// ================ Selectors ================ //
