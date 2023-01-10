import { post, put } from './api';

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
  post('/api/orders', body);

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
export const initiateTransactionsApi = (body: CompleteOrderApiBody) =>
  put('/api/orders', body);
