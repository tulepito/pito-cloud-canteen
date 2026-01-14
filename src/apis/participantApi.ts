import type { VoucherInfo } from '@pages/api/participants/events/voucher/receive.api';
import type { POSTParticipantRating } from '@pages/api/participants/ratings/index.api';
import type { TMemberPlan } from '@redux/slices/shoppingCart.slice';
import type { TUpdateParticipantOrderBody } from '@src/types/order';
import type { ApiResponse } from '@src/utils/response';

import { getApi, postApi, putApi } from './configs';

type TParticipantReviewPlanTxBody = {
  txId: string;
  reviewContent: string;
  reviewRating: number;
  time: string | number;
};
export const participantReviewPlanTx = (body: TParticipantReviewPlanTxBody) => {
  return postApi('/participants/plans/review-restaurant', body);
};

export const participantPostRatingApi = (body: POSTParticipantRating) =>
  postApi('/participants/ratings', body);

export const updateFirstTimeViewOrderApi = (orderId: string) =>
  putApi(`/participants/orders/${orderId}/update-first-time-view-order`);

export const recommendFoodForSubOrdersApi = (body: {
  mappedRecommendFoodToOrderDetail: any;
}) => putApi('/participants/plans/recommend-food-for-sub-orders', body);

export type TFetchOrdersApiParams = {
  startDate: Date;
  endDate: Date;
};

export const fetchOrdersApi = (params: TFetchOrdersApiParams) =>
  getApi('/participants/orders/fetch-order-list', params);

export const receiveVoucherApi = () =>
  putApi<ApiResponse<VoucherInfo>>('/participants/events/voucher/receive', {});

/**
 * Place order for participant
 * @param orderId - order id
 * @param body - body
 * @returns { orderMemberDocumentId: string } - document id
 */
export const placeOrderApi = (
  orderId: string,
  body: TUpdateParticipantOrderBody,
) =>
  postApi<ApiResponse<{ orderMemberDocumentId: string }>>(
    `/participants/orders/${orderId}/place-order`,
    body,
  );

/**
 * Place order failed for participant
 * @param orderId - order id
 * @param body - body
 */
export const placeOrderFailedApi = (
  orderId: string,
  body: {
    planId: string;
    userOrder: TMemberPlan;
    userEmail: string;
    error: string;
  },
) =>
  postApi<ApiResponse<{ message: string }>>(
    `/participants/orders/${orderId}/place-order-failed`,
    body,
  );
