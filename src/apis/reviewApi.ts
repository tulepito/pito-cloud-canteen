import type { AxiosResponse } from 'axios';

import type { RatingListing, TReviewStatus } from '@src/types';
import type { EUserRole } from '@src/utils/enums';
import type { ApiResponse } from '@src/utils/response';

import { getApi, postApi } from './configs';

export const getAdminReviewsApi = (
  page: number,
  perPage: number,
  params: {
    orderCode?: string;
    ratings?: number[];
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

export const getParticipantReviewsApi = (page: number, perPage: number) => {
  return getApi<ApiResponse<(RatingListing & { authorName: string })[]>>(
    '/reviews',
    {
      page,
      perPage,
    },
  );
};

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

export const postProcessReplyReviewApi = (
  reviewId: string,
  replyId: string,
  status: TReviewStatus,
): Promise<AxiosResponse<ApiResponse<RatingListing>>> => {
  return postApi(`/reviews/${reviewId}/reply/${replyId}` as string, {
    status,
  });
};
