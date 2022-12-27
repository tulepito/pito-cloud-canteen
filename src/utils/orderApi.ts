import { post, put } from './api';

type CreateOrderApiBody = {
  companyId: string;
  deliveryAddress: string;
  startDate: Date;
  endDate: Date;
  deliveryHour: string;
  period: number;
  selectedGroups: string[];
  packagePerMember: number;
  orderDeadline?: string;
};
export const createOrderApi = (body: CreateOrderApiBody) =>
  post('/api/order', body);

type AddMealPlanDetailApiBody = {
  orderId: string;
  meal: string;
  orderDetail: {
    [date: string]: {
      restaurant: string; // restaurant listing id
    };
  };
};
export const addMealPlanDetailApi = (body: AddMealPlanDetailApiBody) =>
  post('/api/order/plan', body);

type UpdateMealPlanDetailApiBody = {
  planId: string;
  orderDetail: {
    [date: string]: {
      restaurant: string; // restaurant listing id
    };
  };
};
export const updateMealPlanDetailApi = (body: UpdateMealPlanDetailApiBody) =>
  put('/api/order/plan', body);

type CompleteOrderApiBody = {
  orderId: string;
  planId: string;
};
export const completeOrderApi = (body: CompleteOrderApiBody) =>
  put('/api/order', body);
