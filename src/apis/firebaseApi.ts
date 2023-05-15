import { getApi, postApi, putApi } from './configs';

export type ParticipantSubOrderAddDocumentApiBody = {
  participantId: string;
  planId: string;
  timestamp: number;
};
export const participantSubOrderAddDocumentApi = async (
  body: ParticipantSubOrderAddDocumentApiBody,
) => postApi('/participants/document', body);

export const participantSubOrderGetDocumentApi = async (
  participantId: string,
  txStatus: string,
  limitRecords?: number,
  lastRecord?: number,
) =>
  getApi(`/participants/document`, {
    participantId,
    txStatus,
    limitRecords,
    lastRecord,
  });

export type ParticipantSubOrderUpdateDocumentApiBody = {
  subOrderId: string;
  params: {
    txStatus?: string;
    reviewId?: string;
    status?: string;
  };
};
export const participantSubOrderUpdateDocumentApi = async (
  body: ParticipantSubOrderUpdateDocumentApiBody,
) => putApi('/participants/document', body);
