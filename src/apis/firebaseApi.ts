import type {
  TOrderChangeHistoryItem,
  TSubOrderChangeHistoryItem,
} from '@src/utils/types';

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
  lastRecord?: number | null,
) =>
  getApi(`/participants/document`, {
    participantId,
    txStatus,
    limitRecords,
    lastRecord,
  });

export type ParticipantSubOrderUpdateDocumentApiBody = {
  subOrderId: string; // participantId - planId - timestamp
  params: {
    txStatus?: string;
    reviewId?: string;
    status?: string;
    foodId?: string;
  };
};
export const participantSubOrderUpdateDocumentApi = async (
  body: ParticipantSubOrderUpdateDocumentApiBody,
) => putApi('/participants/document', body);

export const participantSubOrderGetByIdApi = async (subOrderId: string) =>
  getApi(`/participants/document/${subOrderId}`);

export const participantGetNotificationsApi = async () =>
  getApi('/participants/notifications');

export const participantUpdateSeenNotificationApi = async (
  notificationId: string,
) => postApi('/participants/notifications', { notificationId });

export const createOrderChangesHistoryDocumentApi = async (
  orderId: string,
  data: TOrderChangeHistoryItem,
) => postApi(`/orders/${orderId}/history`, data);

export const createSubOrderChangesHistoryDocumentApi = async (
  orderId: string,
  { planId, ...rest }: TSubOrderChangeHistoryItem,
) => postApi(`/orders/${orderId}/plan/${planId}/history`, rest);

export const queryOrderChangesHistoryDocumentApi = async (
  orderId: string,
  planId: string,
  {
    planOrderDate,
    lastRecordCreatedAt,
  }: { planOrderDate: number; lastRecordCreatedAt?: number },
) =>
  getApi(
    `/orders/${orderId}/plan/${planId}/history/?planOrderDate=${planOrderDate}&lastRecordCreatedAt=${lastRecordCreatedAt}`,
  );

export const fetchParticipantFirebaseSubOrderApi = async (
  subOrderDocumentId: string,
) => getApi(`/participants/document/${subOrderDocumentId}`);
