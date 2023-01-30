import type { TObject } from '@utils/types';

import type { TBodyParams } from './configs';
import { getApi, postApi, putApi } from './configs';

type CreateOrderApiBody = {
  companyId: string;
  generalInfo: {
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
  };
  orderDetail: {
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
export const createOrderApi = (body: CreateOrderApiBody) =>
  postApi('/api/orders', body);

type AddMealPlanDetailApiBody = {
  orderId: string;
};
export const addMealPlanDetailApi = (body: AddMealPlanDetailApiBody) =>
  postApi('/api/orders/plan', body);

type UpdateMealPlanDetailApiBody = {
  planId: string;
  orderDetail: {
    [date: string]: {
      restaurant: string; // restaurant listing id
    };
  };
};
export const updateMealPlanDetailApi = (body: UpdateMealPlanDetailApiBody) =>
  putApi('/api/orders/plan', body);

type CompleteOrderApiBody = {
  orderId: string;
  planId: string;
};
export const initiateTransactionsApi = (body: CompleteOrderApiBody) =>
  putApi('/api/orders', body);

// Booker manage order details
export const loadBookerOrderDataApi = (orderId: string) =>
  getApi(`/api/orders/${orderId}`);

export const updateOrderDetailsApi = (orderId: string, body: TObject) =>
  postApi(`/api/orders/${orderId}`, body);

export const deleteParticipantFromOrderApi = (orderId: string, body: TObject) =>
  postApi(`/api/orders/${orderId}/delete-participant`, body);

export const addParticipantToOrderApi = (orderId: string, body: TObject) =>
  postApi(`/api/orders/${orderId}/add-participant`, body);

export const addUpdateMemberOrder = (orderId: string, body: TObject) =>
  putApi(`/api/orders/${orderId}/member-order`, body);

export const sendRemindEmailToMemberApi = (orderId: string, body: TObject) =>
  postApi(`/api/orders/${orderId}/remind-member`, body);

export const queryOrdersApi = (body: TBodyParams) => {
  return postApi(`/api/admin/listings/order/query`, body);
};
