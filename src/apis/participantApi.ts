import type { TRestaurantRating } from '@src/utils/types';

import { postApi } from './configs';

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
