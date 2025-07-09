import type { POSTScannerPlanIdTimestampScanBody } from '@pages/admin/order/POSTScannerPlanIdTimestampScanBody';
import type {
  POSTScannerParticipantScanQRcodeBody,
  POSTScannerPlanIdTimestampScanQRcodeBody,
} from '@pages/qrcode/POSTScannerPlanIdTimestampScanORCodeBody';

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
    barcode: payload.barcode,
    ...(payload.groupId && { groupId: payload.groupId }),
    ...(payload.screen && { screen: payload.screen }),
  });

export const scanQRCodeApi = (
  payload: {
    planId: string;
    timestamp: string;
  } & POSTScannerPlanIdTimestampScanQRcodeBody,
) =>
  postApi(
    `/participants/scanner/${payload.planId}/${payload.timestamp}/scan-qr-code`,
    {
      ...(payload.code && { code: payload.code }),
      ...(payload.screen && { groupId: payload.screen }),
    },
  );

export const scanQRCodeForParticipantApi = (
  payload: POSTScannerParticipantScanQRcodeBody,
) =>
  postApi(`/participants/scanner/qrcode/${payload.currentUserId}/scan`, {
    timestamp: payload.timestamp,
    ...(payload.groupId && { groupId: payload.groupId }),
    ...(payload.screen && { screen: payload.screen }),
  });

export const toggleQRCodeModeApi = (payload: { planId: string }) =>
  putApi(`/participants/scanner/${payload.planId}/toggle-mode`, {});
