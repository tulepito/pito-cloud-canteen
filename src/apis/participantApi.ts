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
