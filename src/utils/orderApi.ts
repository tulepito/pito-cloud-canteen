import { post, put } from './api';

type CreateOrderApiBody = {
  companyId: string;
  bookerId: string;
};
export const createOrderApi = (body: CreateOrderApiBody) =>
  post('/api/orders', body);

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
  put('/api/orders', body);
type AddMealPlanDetailApiBody = {
  orderId: string;
};
export const addMealPlanDetailApi = (body: AddMealPlanDetailApiBody) =>
  post('/api/orders/plan', body);

type UpdateMealPlanDetailApiBody = {
  planId: string;
  orderDetail: {
    [date: string]: {
      restaurant: string; // restaurant listing id
    };
  };
};
export const updateMealPlanDetailApi = (body: UpdateMealPlanDetailApiBody) =>
  put('/api/orders/plan', body);

type CompleteOrderApiBody = {
  orderId: string;
  planId: string;
};
export const completeOrderApi = (body: CompleteOrderApiBody) =>
  put('/api/orders', body);
