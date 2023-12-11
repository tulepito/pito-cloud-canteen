import type { TObject } from '@src/utils/types';

import { deleteApi, getApi, postApi, putApi } from './configs';

export const addAttributesApi = (body: TObject) =>
  postApi('/admin/filters', body);
export const updateAttributesApi = (body: TObject) =>
  putApi('/admin/filters', body);
export const deleteAttributesApi = (body: TObject) =>
  deleteApi('/admin/filters', body);

export const transitPlanApi = ({
  transactionId,
  transition,
}: {
  transactionId: string;
  transition: string;
}) =>
  postApi('/admin/plan/transit', {
    txId: transactionId,
    transition,
  });

export const getPaymentRecordsApi = (params: TObject) =>
  getApi('/admin/payment', params);

export const createPaymentRecordApi = (body: TObject) =>
  postApi('/admin/payment', body);

export const deletePaymentRecordApi = (body: TObject) =>
  deleteApi('/admin/payment', body);

export const getPartnerPaymentRecordsApi = (lastPaymentRecord: number) =>
  getApi('/admin/payment/payment-partner', { lastPaymentRecord });

export const transitionOrderPaymentStatusApi = (
  orderId: string,
  planId: string,
) =>
  postApi('/admin/payment/transition-order-payment-status', {
    orderId,
    planId,
  });

export const confirmClientPaymentApi = (orderId: string) =>
  putApi('/admin/payment/confirm-client-payment', {
    orderId,
  });
export const disapproveClientPaymentApi = (orderId: string) =>
  putApi('/admin/payment/disapprove-client-payment', {
    orderId,
  });

export const confirmPartnerPaymentApi = ({
  planId,
  subOrderDate,
}: {
  planId: string;
  subOrderDate: string | number;
}) =>
  putApi('/admin/payment/confirm-partner-payment', {
    planId,
    subOrderDate,
  });
export const disapprovePartnerPaymentApi = ({
  planId,
  subOrderDate,
}: {
  planId: string;
  subOrderDate: string | number;
}) =>
  putApi('/admin/payment/disapprove-partner-payment', {
    planId,
    subOrderDate,
  });

export const searchRestaurantListFromMenuApi = (params: TObject) =>
  getApi('/admin/listings/order/search-retaurant', params);

export const fetchFoodListFromMenuApi = (params: TObject) =>
  getApi('/admin/listings/order/fetch-food-from-menu', params);

export const responseApprovalRequestApi = (body: TObject) =>
  postApi('/admin/listings/foods/response-approval-request', body);

export const queryRestaurantListingsApi = (params: TObject) =>
  getApi('/admin/listings/restaurant/query', params);

export const handleSendNotificationParticipantAfterEditInProgressOrderApi = (
  orderId: string,
  body: TObject,
) =>
  putApi(
    `/admin/listings/order/${orderId}/handle-send-notification-participant-after-edit-in-progress-order`,
    body,
  );

export const handleSendNotificationPartnerAfterEditInProgressOrderApi = (
  orderId: string,
  body: TObject,
) =>
  putApi(
    `/admin/listings/order/${orderId}/handle-send-notification-partner-after-edit-in-progress-order`,
    body,
  );

export const handleSendNotificationPartnerAfterEditInProgressOrderDetailApi = (
  orderId: string,
  body: TObject,
) =>
  putApi(
    `/admin/listings/order/${orderId}/handle-send-notification-partner-after-edit-in-progress-order-detail`,
    body,
  );

export const handleDeleteOldDataAfterEditInProgressOrderApi = (
  orderId: string,
  body: TObject,
) =>
  putApi(
    `/admin/listings/order/${orderId}/handle-delete-old-data-after-edit-in-progress-order`,
    body,
  );

export const verifyEmailApi = (userId: string) => {
  putApi('/verify-email', { userId });
};
