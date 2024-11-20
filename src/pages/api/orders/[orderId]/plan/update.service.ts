import isEmpty from 'lodash/isEmpty';
import uniq from 'lodash/uniq';

import { isEnableUpdateBookingInfo } from '@helpers/orderHelper';
import { fetchListing, fetchUser } from '@services/integrationHelper';
import { getIntegrationSdk } from '@services/integrationSdk';
import { EOrderType } from '@src/utils/enums';
import type { TPlan } from '@src/utils/orderTypes';
import { denormalisedResponseEntities, Listing } from '@utils/data';
import type { TObject } from '@utils/types';

import { getInitMemberOrder } from './memberOrder.helper';

export enum EApiUpdateMode {
  MERGE = 'merge',
  REPLACE = 'replace',
  DIRECT_UPDATE = 'direct_update',
}

const getMenuListFromOrderDetail = (orderDetail: TPlan['orderDetail']) => {
  const menuIds = Object.values(orderDetail).reduce<string[]>(
    (prev, current) => {
      const { restaurant } = current || {};
      const { menuId } = restaurant || {};

      if (isEmpty(menuId)) {
        return prev;
      }

      return prev.concat(menuId as string);
    },
    [],
  );

  return uniq(menuIds);
};

const getNormalizeDetail = ({
  orderDetail,
  initialMemberOrder,
  isNormalOrder = false,
}: {
  orderDetail: any;
  initialMemberOrder: any;
  isNormalOrder: boolean;
}) => {
  return Object.keys(orderDetail).reduce((acc: TObject, curr: string) => {
    if (orderDetail[curr]) {
      return {
        ...acc,
        [curr]: {
          ...(isNormalOrder && { lineItems: [] }),
          memberOrders: isNormalOrder ? {} : initialMemberOrder,
          ...orderDetail[curr],
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
    orderType = EOrderType.group,
    partnerIds = [],
  } = Listing(orderListing).getMetadata();
  const enabledToUpdateRelatedBookingInfo =
    isEnableUpdateBookingInfo(orderState);
  const companyAccount = await fetchUser(companyId);
  const isNormalOrder = orderType === EOrderType.normal;

  const initialMemberOrder = await getInitMemberOrder({
    companyAccount,
    selectedGroups,
  });

  let currPlan;

  const normalizeDetail = getNormalizeDetail({
    orderDetail,
    initialMemberOrder,
    isNormalOrder,
  });

  let updatedOrderDetail = normalizeDetail;

  if (enabledToUpdateRelatedBookingInfo) {
    currPlan = await fetchListing(planId as string);
    const { orderDetail: oldOrderDetail = {}, menuIds = [] } =
      Listing(currPlan).getMetadata();

    if (updateMode === EApiUpdateMode.MERGE) {
      updatedOrderDetail = getNormalizeDetail({
        orderDetail: { ...oldOrderDetail, ...orderDetail },
        initialMemberOrder,
        isNormalOrder,
      });
    }

    if (updateMode === EApiUpdateMode.DIRECT_UPDATE) {
      updatedOrderDetail = {
        ...oldOrderDetail,
        ...orderDetail,
      };
    }
    const updateMenuIds = uniq(
      menuIds.concat(getMenuListFromOrderDetail(updatedOrderDetail)),
    );

    integrationSdk.listings.update({
      id: orderId,
      metadata: {
        menuIds: updateMenuIds,
      },
    });
    const planListingResponse = await integrationSdk.listings.update(
      {
        id: planId,
        metadata: {
          orderDetail: updatedOrderDetail,
          menuIds: updateMenuIds,
          partnerIds,
        },
      },
      { expand: true },
    );

    const planListing = denormalisedResponseEntities(planListingResponse)[0];

    return planListing;
  }

  return {};
};

export default updatePlan;
