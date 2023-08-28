import type { TObject } from '@src/utils/types';

import { getApi, putApi } from './configs';

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
