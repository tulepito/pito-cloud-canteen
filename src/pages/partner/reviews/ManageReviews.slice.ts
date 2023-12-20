import { createSlice } from '@reduxjs/toolkit';

import { fetchReviewApi, fetchReviewDetailApi } from '@apis/partnerApi';
import { createAsyncThunk } from '@redux/redux.helper';
import type { TReviewDetail, TTotalRating } from '@src/types/partnerReviews';
import type { TObject, TPagination } from '@src/utils/types';

// ================ Initial states ================ //
type TManageReviewsState = {
  isFirstLoad: boolean;
  fetchReviewDetailDataMoreInProgress: boolean;
  fetchReviewDetailDataInProgress: boolean;
  fetchReviewDetailDataError: any;
  managePartnerReviewsPagination: TPagination;

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
  fetchReviewDetailDataMoreInProgress: false,
  fetchReviewDetailDataInProgress: false,
  fetchReviewDetailDataError: null,
  managePartnerReviewsPagination: {
    totalItems: 0,
    totalPages: 1,
    page: 1,
    perPage: 12,
  },

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
  async (
    { page, pageSize, rating, mode = 'replace' }: TObject,
    { getState, dispatch },
  ) => {
    const prevReviewDetailData = getState().ManageReviews.reviewDetailData;
    if (mode === 'append' && page > 1) {
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      dispatch(setFetchReviewDetailDataMoreInProgress(true));
    }
    const response = await fetchReviewDetailApi(page, pageSize, rating);

    const { reviewDetailData: reviewDetailDataResponse, pagination } =
      response.data;
    const reviewDetailData =
      mode === 'append' && page > 1
        ? prevReviewDetailData.concat(reviewDetailDataResponse)
        : reviewDetailDataResponse;

    return {
      reviewDetailData,
      pagination,
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
    setFetchReviewDetailDataMoreInProgress: (state, { payload }) => {
      state.fetchReviewDetailDataMoreInProgress = payload;
    },
  },
  extraReducers: (builder) => {
    builder
      /* =============== loadData =============== */
      .addCase(loadData.pending, (state) => {
        state.fetchReviewDetailDataInProgress = true;
        state.fetchReviewDetailDataError = null;
      })
      .addCase(loadData.fulfilled, (state, { payload }) => {
        state.fetchReviewDetailDataInProgress = false;
        state.fetchReviewDetailDataMoreInProgress = false;
        state.reviewDetailData = payload.reviewDetailData;
        state.managePartnerReviewsPagination = payload.pagination;
      })
      .addCase(loadData.rejected, (state, { error }) => {
        state.fetchReviewDetailDataInProgress = false;
        state.fetchReviewDetailDataMoreInProgress = false;
        state.fetchReviewDetailDataError = error.message;
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
export const { setFetchReviewDetailDataMoreInProgress } =
  ManageReviewsSlice.actions;
export default ManageReviewsSlice.reducer;

// ================ Selectors ================ //
