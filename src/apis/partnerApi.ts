import type { TObject } from '@src/utils/types';

import type { TBodyParams } from './configs';
import { deleteApi, getApi, postApi, putApi } from './configs';

const BASE_URL = '/partner';

export const queryPartnerOrdersApi = (partnerId: string) => {
  return getApi(`${BASE_URL}/${partnerId}/orders`);
};

export const queryPartnerOrderDetailApi = ({
  partnerId,
  orderId,
  date,
}: TObject) => {
  return getApi(`${BASE_URL}/${partnerId}/orders/${orderId}`, { date });
};

export const queryAllPartnerPaymentRecordsApi = ({ partnerId }: TObject) => {
  return getApi(`${BASE_URL}/${partnerId}/payments`);
};

export const toggleAppStatusApi = ({ partnerId }: TObject, body: TObject) => {
  return putApi(`${BASE_URL}/${partnerId}/toggle-app-status`, body);
};

export type TQueryPartnerFoodApiParams = {
  restaurantId: string;
  keywords?: string;
  foodType?: string;
  createAtStart?: string;
  createAtEnd?: string;
};
export const queryPartnerFoodsApi = (params: TObject) =>
  getApi(`${BASE_URL}/food`, params);

export const fetchPartnerFoodApi = (foodId: string) =>
  getApi(`${BASE_URL}/food/${foodId}`);

export const createPartnerFoodApi = (data: TObject) =>
  postApi(`${BASE_URL}/food`, data);

export const updatePartnerFoodApi = (foodId: string, data: TObject) =>
  putApi(`${BASE_URL}/food/${foodId}`, data);

export const removePartnerFoodApi = (foodId: string) =>
  deleteApi(`${BASE_URL}/food/${foodId}`);
export const removePartnerMultipleFoodApi = (body: TBodyParams) =>
  deleteApi(`${BASE_URL}/food/delete-by-ids`, body);

export const fetchFoodEditableApi = (foodId: string) =>
  getApi(`${BASE_URL}/food/${foodId}/fetch-editable`);

export const fetchFoodDeletableApi = (foodId: string) =>
  getApi(`${BASE_URL}/food/${foodId}/fetch-deletable`);
