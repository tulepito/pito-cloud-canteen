import type { TObject } from '@utils/types';

import type { TBodyParams } from './configs';
import { deleteApi, getApi, postApi, putApi } from './configs';

// Manage Order apis
type TCreateBookerOrderApiBody = {
  companyId: string;
  bookerId: string;
  isCreatedByAdmin?: boolean;
};

export type TUpdateOrderApiBody = {
  orderId?: string;
  generalInfo?: {
    deliveryAddress?: {
      address: string;
      origin: {
        lat: number;
        lng: number;
      };
    };
    startDate?: number;
    endDate?: number;
    deliveryHour?: string;
    selectedGroups?: string[];
    packagePerMember?: number;
    deadlineDate?: number;
    deadlineHour?: string;
    period?: number;
    nutritions?: string[];
    staffName?: string;
    shipperName?: string;
  };
};

export const createBookerOrderApi = (body: TCreateBookerOrderApiBody) =>
  postApi('/orders', body);

export const getBookerOrderDataApi = (orderId: string) =>
  getApi(`/orders/${orderId}`);

export const updateOrderApi = (orderId: string, body: TUpdateOrderApiBody) =>
  putApi(`/orders/${orderId}`, body);
// ------------------------- //

// Manage Order - Plan detail
export const createPlanDetailsApi = (orderId: string, body: TObject) =>
  postApi(`/orders/${orderId}/plan`, body);

export const updatePlanDetailsApi = (orderId: string, body: TObject) =>
  putApi(`/orders/${orderId}/plan`, body);
// ------------------------- //

// Manage participants
export const addParticipantToOrderApi = (orderId: string, body: TObject) =>
  postApi(`/orders/${orderId}/participant`, body);

export const deleteParticipantFromOrderApi = (orderId: string, body: TObject) =>
  deleteApi(`/orders/${orderId}/participant`, body);
// ------------------------- //

export const addUpdateMemberOrder = (orderId: string, body: TObject) =>
  putApi(`/orders/${orderId}/member-order`, body);

export const sendRemindEmailToMemberApi = (orderId: string, body: TObject) =>
  postApi(`/orders/${orderId}/remind-member`, body);

export const queryOrdersApi = (body: TBodyParams) => {
  return getApi(`/admin/listings/order`, body);
};

// Delete draft own draft order
export const bookerDeleteDraftOrderApi = ({
  companyId,
  orderId,
}: {
  companyId: string;
  orderId: string;
}) => {
  return deleteApi(`/company/${companyId}/orders/${orderId}`);
};
// Request approval order
export const requestApprovalOrderApi = (orderId: string) => {
  return putApi(`/orders/${orderId}/request-approval-order`);
};

// Cancel pending approval order
export const bookerCancelPendingApprovalOrderApi = (orderId: string) => {
  return putApi(`/orders/${orderId}/cancel-pending-approval-order`);
};

// Start order process (inProgress)
export const bookerStartOrderApi = ({
  orderId,
  planId,
}: {
  orderId: string;
  planId: string;
}) => {
  return putApi(`/orders/${orderId}/plan/${planId}/start-order`);
};

// Allow picking for order
export const bookerPublishOrderApi = (orderId: string) => {
  return postApi(`/orders/${orderId}/publish-order`);
};

// Cancel picking order
export const cancelPickingOrderApi = (orderId: string) => {
  return putApi(`/orders/${orderId}/cancel-picking-order`);
};
