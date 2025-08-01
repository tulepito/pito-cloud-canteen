import axios from 'axios';

import type { POSTScannerPlanIdTimestampScanBody } from '@pages/admin/order/POSTScannerPlanIdTimestampScanBody';
import type { POSTScannerParticipantScanQRcodeBody } from '@pages/qrcode/POSTScannerPlanIdTimestampScanORCodeBody';

import { postApi, putApi } from './configs';

export const toggleScannerModeApi = (payload: { planId: string }) =>
  putApi(`/admin/scanner/${payload.planId}/toggle-mode`, {});

export const scanApi = (
  payload: {
    planId: string;
    timestamp: string;
  } & POSTScannerPlanIdTimestampScanBody,
) =>
  postApi(`/admin/scanner/${payload.planId}/${payload.timestamp}/scan`, {
    memberId: payload.memberId,
    ...(payload.groupId && { groupId: payload.groupId }),
    ...(payload.screen && { screen: payload.screen }),
  });

let scanAbortController: AbortController | null = null;

export const scanQRCodeForParticipantApi = async (
  payload: POSTScannerParticipantScanQRcodeBody,
) => {
  if (scanAbortController) {
    console.warn('[ABORTED] Previous scan request aborted');
    scanAbortController.abort();
  }

  scanAbortController = new AbortController();

  try {
    return await postApi(
      `/participants/scanner/qrcode/${payload.currentUserId}/scan/`,
      {
        timestamp: payload.timestamp,
        companyId: payload.companyId,
        ...(payload.groupId && { groupId: payload.groupId }),
        ...(payload.screen && { screen: payload.screen }),
      },
      {
        signal: scanAbortController.signal,
      },
    );
  } catch (error: any) {
    if (axios.isCancel(error) || error.name === 'AbortError') {
      console.warn('[IGNORED] Scan request was aborted');

      return;
    }
    throw error;
  } finally {
    scanAbortController = null;
  }
};

export const toggleQRCodeModeApi = (payload: { planId: string }) =>
  putApi(`/participants/scanner/${payload.planId}/toggle-mode`, {});
