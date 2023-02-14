import { fetchListing, fetchUser } from '@services/integrationHelper';
import { getIntegrationSdk } from '@services/integrationSdk';
import { denormalisedResponseEntities, Listing } from '@utils/data';
import { EOrderStates } from '@utils/enums';
import type { TObject } from '@utils/types';
import { isEmpty } from 'lodash';

import { getInitMemberOrder } from './memberOrder.helper';

export enum EApiUpdateMode {
  MERGE = 'merge',
  REPLACE = 'replace',
}

const getNormalizeDetail = ({
  orderDetail,
  initialMemberOrder,
}: {
  orderDetail: any;
  initialMemberOrder: any;
}) => {
  return Object.keys(orderDetail).reduce((acc: TObject, curr: string) => {
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
  }, {});
};

const updatePlan = async ({
  orderId,
  planId,
  orderDetail,
  updateMode,
}: {
  orderId: string;
  planId: string;
  orderDetail: any;
  updateMode: EApiUpdateMode;
}) => {
  const integrationSdk = getIntegrationSdk();

  const orderListing = await fetchListing(orderId as string);
  const {
    companyId,
    selectedGroups = [],
    orderState,
  } = Listing(orderListing).getMetadata();
  const enabledToUpdateRelatedBookingInfo = orderState === EOrderStates.isNew;
  const companyAccount = await fetchUser(companyId);

  const initialMemberOrder = getInitMemberOrder({
    companyAccount,
    selectedGroups,
  });

  let currPlan;

  const normalizeDetail = getNormalizeDetail({
    orderDetail,
    initialMemberOrder,
  });

  let updatedOrderDetail = normalizeDetail;

  if (enabledToUpdateRelatedBookingInfo && !isEmpty(updatedOrderDetail)) {
    if (updateMode === EApiUpdateMode.MERGE) {
      currPlan = await fetchListing(planId as string);
      const { orderDetail: oldOrderDetail } = Listing(currPlan).getMetadata();

      updatedOrderDetail = getNormalizeDetail({
        orderDetail: { ...oldOrderDetail, ...orderDetail },
        initialMemberOrder,
      });
    }

    const planListingResponse = await integrationSdk.listings.update(
      {
        id: planId,
        metadata: {
          orderDetail: updatedOrderDetail,
        },
      },
      { expand: true },
    );

    const planListing = denormalisedResponseEntities(planListingResponse)[0];
    return planListing;
  }
};

export default updatePlan;
