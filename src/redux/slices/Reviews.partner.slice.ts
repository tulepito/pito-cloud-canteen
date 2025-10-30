import { createSlice } from '@reduxjs/toolkit';

import { getPartnerReviewsApi, postReplyReviewApi } from '@apis/reviewApi';
import { createAsyncThunk } from '@redux/redux.helper';
import type { RatingListing } from '@src/types';
import type { EUserRole } from '@src/utils/enums';
import type { TPagination } from '@src/utils/types';
import { storableError } from '@utils/errors';

// ================ Async thunks ================ //
const FETCH_PARTNER_REVIEWS = 'app/Reviews/FETCH_PARTNER_REVIEWS';
const SUBMIT_REPLY = 'app/Reviews/SUBMIT_REPLY';

export const fetchPartnerReviews = createAsyncThunk(
  FETCH_PARTNER_REVIEWS,
  async (
    params: {
      page?: number;
      limit?: number;
      search?: string;
      userSearch?: string;
      rating?: number;
    } = {},
  ) => {
    const { page = 1, limit = 10 } = params;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      pageSize: limit.toString(),
    });

    if (params.search) {
      queryParams.append('search', params.search);
    }
    if (params.userSearch) {
      queryParams.append('userSearch', params.userSearch);
    }
    if (params.rating) {
      queryParams.append('rating', params.rating.toString());
    }
    const response = await getPartnerReviewsApi(page, limit, {
      search: params.search,
      userSearch: params.userSearch,
      rating: params.rating,
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
    const res = await getPartnerReviewsApi(page, limit, {
      search: getState().partnerReviews.filters.search,
      userSearch: getState().partnerReviews.filters.userSearch,
      rating: getState().partnerReviews.filters.rating,
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
        status: 'pending',
        approvedAt: undefined,
        approvedBy: undefined,
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
          page: getState().partnerReviews.pagination.page as number,
          limit: getState().partnerReviews.pagination.perPage as number,
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
    search: string;
    userSearch: string;
    rating: number | undefined;
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
    search: '',
    userSearch: '',
    rating: undefined,
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
      state.filters = { search: '', userSearch: '', rating: undefined };
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
        status,
        approvedAt,
        approvedBy,
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
          status,
          approvedAt,
          approvedBy,
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
      .addCase(fetchPartnerReviews.pending, (state) => {
        state.fetchReviewsInProgress = true;
        state.fetchReviewsError = null;
      })
      .addCase(fetchPartnerReviews.fulfilled, (state, action) => {
        state.fetchReviewsInProgress = false;
        const newReviews = action.payload.reviews;
        state.reviews = newReviews;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchPartnerReviews.rejected, (state, action) => {
        state.fetchReviewsInProgress = false;
        state.fetchReviewsError = action.payload;
      })
      .addCase(fetchReviewsSilent.fulfilled, (state, action) => {
        const newReviews = action.payload.reviews;
        console.log('newReviews', newReviews);

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
