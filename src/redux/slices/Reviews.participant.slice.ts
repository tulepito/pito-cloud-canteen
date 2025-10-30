import { createSlice } from '@reduxjs/toolkit';

import { getParticipantReviewsApi } from '@apis/reviewApi';
import { createAsyncThunk } from '@redux/redux.helper';
import type { RatingListing } from '@src/types';
import type { TPagination } from '@src/utils/types';
import { storableError } from '@utils/errors';

// ================ Async thunks ================ //
const FETCH_PARTICIPANT_REVIEWS = 'app/Reviews/FETCH_PARTICIPANT_REVIEWS';

export const fetchParticipantReviews = createAsyncThunk(
  FETCH_PARTICIPANT_REVIEWS,
  async (
    params: {
      page?: number;
      limit?: number;
    } = {},
  ) => {
    const { page = 1, limit = 10 } = params;

    const response = await getParticipantReviewsApi(page, limit);

    const data = response.data.data;

    return {
      reviews: data || [],
      pagination: response.data.pagination || {
        totalItems: 0,
        totalPages: 0,
        page: 1,
        perPage: limit,
      },
    };
  },
  {
    serializeError: storableError,
  },
);

// ================ Initial state ================ //
type TParticipantReviewsState = {
  // Data
  reviews: (RatingListing & { authorName: string })[];
  pagination: TPagination;

  fetchReviewsInProgress: boolean;
  fetchReviewsError: any;
};

const initialState: TParticipantReviewsState = {
  reviews: [] as (RatingListing & { authorName: string })[],
  pagination: {
    totalItems: 0,
    totalPages: 1,
    page: 1,
    perPage: 10,
  },
  fetchReviewsInProgress: false,
  fetchReviewsError: null,
};

// ================ Slice ================ //
const participantReviewsSlice = createSlice({
  name: 'participantReviews',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchParticipantReviews.pending, (state) => {
        state.fetchReviewsInProgress = true;
        state.fetchReviewsError = null;
      })
      .addCase(fetchParticipantReviews.fulfilled, (state, action) => {
        state.fetchReviewsInProgress = false;
        const newReviews = action.payload.reviews;
        state.reviews = newReviews;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchParticipantReviews.rejected, (state, action) => {
        state.fetchReviewsInProgress = false;
        state.fetchReviewsError = action.payload;
      });
  },
});

export default participantReviewsSlice.reducer;
