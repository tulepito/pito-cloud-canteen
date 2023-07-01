import { getApi } from './configs';

const BASE_URL = '/partner';

export const queryPartnerOrdersApi = (partnerId: string) => {
  return getApi(`${BASE_URL}/${partnerId}/orders`);
};
