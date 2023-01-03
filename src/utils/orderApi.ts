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
