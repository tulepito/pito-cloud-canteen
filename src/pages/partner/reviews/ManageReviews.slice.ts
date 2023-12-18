import { createSlice } from '@reduxjs/toolkit';

import { fetchReviewDetailApi } from '@apis/partnerApi';
import { createAsyncThunk } from '@redux/redux.helper';
import type { TReviewDetail, TTotalRating } from '@src/types/partnerReviews';
import type { TObject } from '@src/utils/types';

// ================ Initial states ================ //
type TManageReviewsState = {
  isFirstLoad: boolean;
  fetchReviewDetailDatasInProgress: boolean;
  fetchReviewDetailDatasError: any;
  ratingDetail: TTotalRating[];
  reviewDetailData: TReviewDetail[];
  totalReviewDetailData: number;
  foodRating: number;
  packagingRating: number;
  pointRating: number;
  totalRating: number;
};
const initialState: TManageReviewsState = {
  isFirstLoad: true,
  fetchReviewDetailDatasInProgress: false,
  fetchReviewDetailDatasError: null,
  reviewDetailData: [],
  ratingDetail: [],
  totalReviewDetailData: 0,
  foodRating: 0,
  packagingRating: 0,
  pointRating: 0,
  totalRating: 0,
};

// ================ Thunk types ================ //

// ================ Async thunks ================ //
const loadData = createAsyncThunk(
  'app/ManageReviews/LOAD_DATA',
  async ({ page, pageSize, rating }: TObject) => {
    const response = await fetchReviewDetailApi(page, pageSize, rating);

    const {
      totalRatingDetail,
      reviewDetailData,
      totalReviewDetailData,
      ratingDetail,

      foodRating,
      packagingRating,
      pointRating,
      totalRating,
    } = response.data;

    return {
      totalRatingDetail,
      reviewDetailData,
      totalReviewDetailData,
      ratingDetail,

      foodRating,
      packagingRating,
      pointRating,
      totalRating,
    };
  },
);

export const ManageReviewsThunks = {
  loadData,
};

// ================ Slice ================ //
const ManageReviewsSlice = createSlice({
  name: 'ManageReviews',
  initialState,
  reducers: {
    clearLoadedReviewDetailData: (state) => {
      state.ratingDetail = [];
      state.ratingDetail = [];
      state.totalReviewDetailData = 0;

      state.foodRating = 0;
      state.packagingRating = 0;
      state.pointRating = 0;
      state.totalRating = 0;
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
        state.isFirstLoad = false;
        state.reviewDetailData = payload.reviewDetailData;
        state.ratingDetail = payload.reviewDetailData;
        state.totalReviewDetailData = payload.totalReviewDetailData;

        state.foodRating = payload.foodRating;
        state.packagingRating = payload.packagingRating;
        state.pointRating = payload.pointRating;
        state.totalRating = payload.totalRating;
      })
      .addCase(loadData.rejected, (state, { error }) => {
        state.fetchReviewDetailDatasInProgress = false;
        state.fetchReviewDetailDatasError = error.message;
      });
  },
});

// ================ Actions ================ //
export const ManageReviewsActions = ManageReviewsSlice.actions;
export default ManageReviewsSlice.reducer;

// ================ Selectors ================ //
