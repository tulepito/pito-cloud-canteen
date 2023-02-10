import type { TObject } from '@utils/types';

import type { TBodyParams } from './configs';
import { deleteApi, getApi, postApi, putApi } from './configs';

type CreateOrderApiBody = {
  companyId: string;
  bookerId: string;
};
export const createOrderApi = (body: CreateOrderApiBody) =>
  postApi('/orders', body);

type UpdateOrderApiBody = {
  orderId: string;
  generalInfo?: {
    deliveryAddress: {
      address: string;
      origin: {
        lat: number;
        lng: number;
      };
    };
    startDate: number;
    endDate: number;
    deliveryHour: string;
    selectedGroups: string[];
    packagePerMember: number;
    deadlineDate: number;
    deadlineHour: string;
    period?: number;
    nutritions: string[];
    staffName?: string;
    shipperName?: string;
  };
  orderDetail?: {
    [date: string]: {
      restaurant: {
        id: string;
        restaurantName: string;
      };
      foodList: {
        [foodId: string]: {
          foodPrice: number;
          foodName: string;
        };
      };
    };
  };
};
export const updateOrderApi = (body: UpdateOrderApiBody) =>
  putApi('/orders', body);

type AddMealPlanDetailApiBody = {
  orderId: string;
};
export const addMealPlanDetailApi = (body: AddMealPlanDetailApiBody) =>
  postApi('/orders/plan', body);

type UpdateMealPlanDetailApiBody = {
  planId: string;
  orderDetail: {
    [date: string]: {
      restaurant: string; // restaurant listing id
    };
  };
};
export const updateMealPlanDetailApi = (body: UpdateMealPlanDetailApiBody) =>
  putApi('/orders/plan', body);

type CompleteOrderApiBody = {
  orderId: string;
  planId: string;
};
export const initiateTransactionsApi = (body: CompleteOrderApiBody) =>
  putApi('/orders', body);

// Booker manage order details
export const loadBookerOrderDataApi = (orderId: string) =>
  getApi(`/orders/${orderId}`);

export const updateOrderDetailsApi = (orderId: string, body: TObject) =>
  postApi(`/orders/${orderId}`, body);

export const addParticipantToOrderApi = (orderId: string, body: TObject) =>
  postApi(`/orders/${orderId}/participant`, body);

export const deleteParticipantFromOrderApi = (orderId: string, body: TObject) =>
  deleteApi(`/orders/${orderId}/participant`, body);

export const addUpdateMemberOrder = (orderId: string, body: TObject) =>
  putApi(`/orders/${orderId}/member-order`, body);

export const sendRemindEmailToMemberApi = (orderId: string, body: TObject) =>
  postApi(`/orders/${orderId}/remind-member`, body);

export const queryOrdersApi = (body: TBodyParams) => {
  return postApi(`/admin/listings/order/query`, body);
};

export const bookerDeleteDraftOrderApi = ({
  companyId,
  orderId,
}: {
  companyId: string;
  orderId: string;
}) => {
  return deleteApi(`/company/${companyId}/orders/${orderId}`);
};
