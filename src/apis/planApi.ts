import { postApi } from './configs';

export const updateDeliveryInfo = (payload: {
  planId: string;
  subOrderTimestamp: string;
  deliveryPhoneNumber: string;
  checkList: string[];
}) => {
  const { planId, ..._payload } = payload;

  return postApi(`/plans/${planId}/update-delivery-info/`, _payload);
};
