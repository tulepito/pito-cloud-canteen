import { createSlice } from '@reduxjs/toolkit';

import { getAdminReviewsApi, postReplyReviewApi } from '@apis/reviewApi';
import { createAsyncThunk } from '@redux/redux.helper';
import type { RatingListing } from '@src/types';
import type { EUserRole } from '@src/utils/enums';
import type { TPagination } from '@src/utils/types';
import { storableError } from '@utils/errors';

// ================ Async thunks ================ //
const FETCH_ADMIN_REVIEWS = 'app/Reviews/FETCH_ADMIN_REVIEWS';
const SUBMIT_REPLY = 'app/Reviews/SUBMIT_REPLY';

export const fetchReviews = createAsyncThunk(
  FETCH_ADMIN_REVIEWS,
  async (
    params: {
      page?: number;
      limit?: number;
      orderCode?: string;
      ratings?: number[];
    } = {},
  ) => {
    const { page = 1, limit = 10 } = params;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      pageSize: limit.toString(),
    });

    if (params.orderCode) {
      queryParams.append('orderCode', params.orderCode);
    }
    if (params.ratings) {
      queryParams.append('rating', params.ratings.join(','));
    }
    const response = await getAdminReviewsApi(page, limit, {
      orderCode: params.orderCode,
      ratings: params.ratings,
    });

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

export const fetchReviewsSilent = createAsyncThunk(
  'app/Reviews/FETCH_REVIEWS_SILENT',
  async ({ page, limit }: { page: number; limit: number }, { getState }) => {
    const res = await getAdminReviewsApi(page, limit, {
      orderCode: getState().adminReviews.filters.orderCode,
      ratings: getState().adminReviews.filters.ratings,
    });

    return {
      reviews: res.data.data || [],
      pagination: res.data.pagination || {
        totalItems: 0,
        totalPages: 0,
        page: 1,
        perPage: limit,
      },
    };
  },
  { serializeError: storableError },
);

export const submitReply = createAsyncThunk<
  { reviewId: string; reply: RatingListing; tempId: string },
  {
    reviewId: string;
    replyRole: EUserRole;
    replyContent: string;
    authorId: string;
    authorName: string;
  }
>(
  SUBMIT_REPLY,
  async (
    {
      reviewId,
      replyRole,
      replyContent,
      authorId,
      authorName,
    }: {
      reviewId: string;
      replyRole: EUserRole;
      replyContent: string;
      authorId: string;
      authorName: string;
      syncStrategy?: 'full-refetch' | 'selective-update';
    },
    { dispatch, rejectWithValue, getState },
  ) => {
    const tempId = `temp-${Date.now()}`;

    // Optimistic update - thêm reply ngay lập tức
    dispatch({
      type: 'reviews/addLocalReply',
      payload: {
        reviewId,
        replyContent,
        authorId,
        authorName,
        replyRole,
        tempId,
      },
    });

    try {
      const response = await postReplyReviewApi(
        reviewId,
        replyRole,
        replyContent,
      );

      dispatch(
        fetchReviewsSilent({
          page: getState().adminReviews.pagination.page as number,
          limit: getState().adminReviews.pagination.perPage as number,
        }),
      );

      return { reviewId, reply: response.data, tempId };
    } catch (err) {
      // Rollback optimistic update nếu có lỗi
      dispatch({
        type: 'reviews/removeLocalReply',
        payload: { reviewId, tempId },
      });
      console.error('Error submitting reply:', err);

      return rejectWithValue(err);
    }
  },
  { serializeError: storableError },
);

// ================ Initial state ================ //
type TReviewsState = {
  // Data
  reviews: (RatingListing & { authorName: string })[];
  pagination: TPagination;

  // Loading states
  fetchReviewsInProgress: boolean;
  submitReplyInProgress: boolean;

  // Error states
  fetchReviewsError: any;
  submitReplyError: any;

  // UI states
  filters: {
    orderCode: string | undefined;
    ratings: number[] | undefined;
  };
};

const initialState: TReviewsState = {
  reviews: [] as (RatingListing & { authorName: string })[],
  pagination: {
    totalItems: 0,
    totalPages: 1,
    page: 1,
    perPage: 10,
  },
  fetchReviewsInProgress: false,
  submitReplyInProgress: false,
  fetchReviewsError: null,
  submitReplyError: null,
  filters: {
    orderCode: undefined,
    ratings: undefined,
  },
};

// ================ Slice ================ //
const reviewsSlice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = { orderCode: undefined, ratings: undefined };
    },
    clearErrors: (state) => {
      state.fetchReviewsError = null;
      state.submitReplyError = null;
    },

    addLocalReply: (state, action) => {
      const {
        reviewId,
        replyContent,
        authorId,
        authorName,
        replyRole,
        tempId,
      } = action.payload;
      const review = state.reviews.find((r) => r.id?.uuid === reviewId);
      if (review) {
        const newReply = {
          id: tempId,
          authorId,
          authorName,
          replyRole,
          replyContent,
          repliedAt: Date.now(),
          pending: true,
        };
        if (!review?.attributes?.metadata?.replies) {
          review.attributes!.metadata!.replies = [];
        }
        review?.attributes?.metadata?.replies?.push(newReply);
      }
    },

    removeLocalReply: (state, action) => {
      const { reviewId, tempId } = action.payload;
      const review = state.reviews.find((r) => r.id?.uuid === reviewId);
      if (review && review?.attributes?.metadata?.replies) {
        review.attributes.metadata.replies =
          review?.attributes?.metadata?.replies?.filter(
            (reply) => reply?.id !== tempId,
          );
      }
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchReviews.pending, (state) => {
        state.fetchReviewsInProgress = true;
        state.fetchReviewsError = null;
      })
      .addCase(fetchReviews.fulfilled, (state, action) => {
        state.fetchReviewsInProgress = false;
        const newReviews = action.payload.reviews;
        state.reviews = newReviews;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchReviews.rejected, (state, action) => {
        state.fetchReviewsInProgress = false;
        state.fetchReviewsError = action.payload;
      })
      .addCase(fetchReviewsSilent.fulfilled, (state, action) => {
        const newReviews = action.payload.reviews;

        newReviews.forEach((serverReview) => {
          const existingReviewIndex = state.reviews.findIndex(
            (r) => r.id?.uuid === serverReview.id?.uuid,
          );

          if (existingReviewIndex !== -1) {
            const existingReview = state.reviews[existingReviewIndex];
            const serverReplies =
              serverReview.attributes?.metadata?.replies || [];
            const mergedReplies = [...serverReplies];

            state.reviews[existingReviewIndex] = {
              ...existingReview,
              attributes: {
                ...existingReview.attributes,
                ...serverReview.attributes,
                metadata: {
                  ...existingReview.attributes?.metadata,
                  ...serverReview.attributes?.metadata,
                  replies: mergedReplies,
                },
              },
            };
          } else {
            state.reviews.push(serverReview);
          }
        });

        state.pagination = action.payload.pagination;
      });

    builder
      .addCase(submitReply.pending, (state) => {
        state.submitReplyInProgress = true;
        state.submitReplyError = null;
      })
      .addCase(submitReply.fulfilled, (state) => {
        state.submitReplyInProgress = false;
      })
      .addCase(submitReply.rejected, (state, action) => {
        state.submitReplyInProgress = false;
        state.submitReplyError = action.payload;
      });
  },
});

export const {
  setFilters,
  clearFilters,
  clearErrors,
  addLocalReply,
  removeLocalReply,
} = reviewsSlice.actions;

export default reviewsSlice.reducer;
