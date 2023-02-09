import { fetchListing, fetchUser } from '@services/integrationHelper';
import { getIntegrationSdk } from '@services/integrationSdk';
import { denormalisedResponseEntities, LISTING } from '@utils/data';

import { getInitMemberOrder } from './memberOrder.helper';

export const UPDATE_MODES: Record<string, string> = {
  MERGE: 'merge',
  RELACE: 'replace',
};

export type TUpdateMode = 'merge' | 'replace';

const updatePlan = async ({
  orderId,
  planId,
  orderDetail,
  updateMode,
}: {
  orderId: string;
  planId: string;
  orderDetail: any;
  updateMode: TUpdateMode;
}) => {
  const integrationSdk = getIntegrationSdk();

  const orderListing = await fetchListing(orderId as string);
  const { companyId, selectedGroups = [] } =
    LISTING(orderListing).getMetadata();

  const companyAccount = await fetchUser(companyId);

  const initialMemberOrder = getInitMemberOrder({
    companyAccount,
    selectedGroups,
  });

  let currPlan;
  const normalizeDetail = Object.keys(orderDetail).reduce(
    (acc: Record<string, any>, curr: string) => {
      if (orderDetail[curr]) {
        return {
          ...acc,
          [curr]: {
            ...orderDetail[curr],
            memberOrders: initialMemberOrder,
          },
        };
      }
      return acc;
    },
    {},
  );

  let updatedOrderDetail = normalizeDetail;

  if (updateMode === 'merge') {
    currPlan = await fetchListing(planId as string);
    const { orderDetail: oldOrderDetail } = LISTING(currPlan).getMetadata();
    updatedOrderDetail = {
      ...oldOrderDetail,
      ...normalizeDetail,
    };
  }

  const planListingResponse = await integrationSdk.listings.update({
    id: planId,
    metadata: {
      orderDetail: updatedOrderDetail,
    },
  });

  const planListing = denormalisedResponseEntities(planListingResponse)[0];
  return planListing;
};

export default updatePlan;
