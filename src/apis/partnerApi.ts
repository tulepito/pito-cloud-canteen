import type { TObject } from '@src/utils/types';

import { getApi } from './configs';

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
