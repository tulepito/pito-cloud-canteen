import type { TRestaurantRating } from '@src/utils/types';

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

type TParticipantPostRatingApiBody = {
  companyName: string;
  rating: TRestaurantRating;
  imageIdList?: string[];
  detailTextRating?: string;
  planId?: string;
};
export const participantPostRatingApi = (body: TParticipantPostRatingApiBody) =>
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
