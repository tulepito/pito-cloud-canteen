import type { POSTDeliveryAgentsMealsBody } from '@pages/api/admin/delivery-agents-meals/[planId]/index.api';
import type { GETDeliveryAgentsMealsQuery } from '@pages/api/admin/delivery-agents-meals/index.api';

import { getApi, postApi } from './configs';

export const setDeliveryAgentsMealsApi = ({
  planId,
  ...payload
}: POSTDeliveryAgentsMealsBody & {
  planId: string;
}) => postApi(`/admin/delivery-agents-meals/${planId}/`, payload);

export const getAllDeliveryAgentsMealsApi = (
  payload: GETDeliveryAgentsMealsQuery,
) => getApi(`/admin/delivery-agents-meals/`, payload);
