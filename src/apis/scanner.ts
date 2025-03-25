import type { POSTScannerPlanIdTimestampScanBody } from '@pages/admin/order/POSTScannerPlanIdTimestampScanBody';

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
  });
