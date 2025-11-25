import type { AxiosResponse } from 'axios';

import type { RatingListing, TReviewReplyStatus } from '@src/types';
import type { EUserRole } from '@src/utils/enums';
import type { ApiResponse } from '@src/utils/response';

import { getApi, postApi } from './configs';

/**
 * Get admin reviews
 * @param page - Page number
 * @param perPage - Number of items per page
 * @param params - Query parameters
 * @returns Admin reviews
 */
export const getAdminReviewsApi = (
  page: number,
  perPage: number,
  params: {
    orderCode?: string;
    ratings?: number[];
    partnerReplyStatus?: TReviewReplyStatus;
  },
) => {
  return getApi<ApiResponse<(RatingListing & { authorName: string })[]>>(
    '/reviews/admin',
    {
      page,
      perPage,
      ...params,
    },
  );
};

/**
 * Get participant reviews
 * @param page - Page number
 * @param perPage - Number of items per page
 * @returns Participant reviews
 */
export const getParticipantReviewsApi = (page: number, perPage: number) => {
  return getApi<ApiResponse<(RatingListing & { authorName: string })[]>>(
    '/reviews',
    {
      page,
      perPage,
    },
  );
};

/**
 * Get partner reviews
 * @param page - Page number
 * @param perPage - Number of items per page
 * @param params - Query parameters
 * @returns Partner reviews
 */
export const getPartnerReviewsApi = (
  page: number,
  perPage: number,
  params: {
    orderCode?: string;
    ratings?: number[];
  },
) => {
  return getApi<ApiResponse<(RatingListing & { authorName: string })[]>>(
    '/reviews/partner',
    {
      page,
      perPage,
      ...params,
    },
  );
};

/**
 * Post reply review
 * @param reviewId - Review ID
 * @param replyRole - Reply role
 * @param replyContent - Reply content
 * @returns Reply review
 */
export const postReplyReviewApi = (
  reviewId: string,
  replyRole: EUserRole,
  replyContent: string,
): Promise<AxiosResponse<RatingListing>> => {
  return postApi(`/reviews/${reviewId}/reply`, {
    replyRole,
    replyContent,
  });
};

/**
 * Post process reply review
 * @param reviewId - Review ID
 * @param replyId - Reply ID
 * @param status - Reply status
 * @returns Processed reply review
 */
export const postProcessReplyReviewApi = (
  reviewId: string,
  replyId: string,
  status: TReviewReplyStatus,
): Promise<AxiosResponse<ApiResponse<RatingListing>>> => {
  return postApi(`/reviews/${reviewId}/reply/${replyId}` as string, {
    status,
  });
};
