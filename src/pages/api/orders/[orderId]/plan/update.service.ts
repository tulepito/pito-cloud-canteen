import isEmpty from 'lodash/isEmpty';
import uniq from 'lodash/uniq';

import { convertDateToVNTimezone } from '@helpers/dateHelpers';
import { isEnableUpdateBookingInfo } from '@helpers/orderHelper';
import { fetchListing, fetchUser } from '@services/integrationHelper';
import { getIntegrationSdk } from '@services/integrationSdk';
import { createSlackNotification } from '@services/slackNotification';
import type { OrderDetail, OrderListing, PlanListing } from '@src/types';
import { EOrderType, ESlackNotificationType } from '@src/utils/enums';
import type { TPlan } from '@src/utils/orderTypes';
import { denormalisedResponseEntities, Listing } from '@utils/data';
import type { TObject } from '@utils/types';

import { getInitMemberOrder } from './memberOrder.helper';

const sendRestaurantChangedSlackNotification = async (
  orderListing: OrderListing,
  newOrderDetail: OrderDetail,
) => {
  const differentOrderDetail = Object.keys(newOrderDetail).reduce(
    (acc, date) => {
      const newRestaurantName =
        newOrderDetail[date]?.restaurant?.restaurantName;
      const oldRestaurantName =
        newOrderDetail[date]?.oldValues?.[0]?.restaurant?.restaurantName;

      if (
        oldRestaurantName &&
        newRestaurantName &&
        newRestaurantName !== oldRestaurantName
      ) {
        return [
          ...acc,
          {
            oldRestaurantName,
            newRestaurantName,
            date: convertDateToVNTimezone(new Date(+date)).split('T')[0],
          },
        ];
      }

      return acc;
    },
    [] as {
      oldRestaurantName?: string;
      newRestaurantName?: string;
      date: string;
    }[],
  );

  const changes = Object.values(differentOrderDetail);

  createSlackNotification(ESlackNotificationType.RESTAURANT_CHANGED, {
    restaurantChangedData: {
      orderName: orderListing.attributes?.publicData?.orderName!,
      orderLink: `${process.env.NEXT_PUBLIC_CANONICAL_URL}/admin/order/${orderListing.id?.uuid}`,
      orderCode: orderListing.attributes?.title!,
      changes,
    },
  });
};

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

  const orderListing: OrderListing = await fetchListing(orderId as string);

  const {
    companyId,
    selectedGroups = [],
    orderState,
    orderType = EOrderType.group,
    partnerIds = [],
  } = Listing(orderListing as any).getMetadata();
  const enabledToUpdateRelatedBookingInfo =
    isEnableUpdateBookingInfo(orderState);
  const companyAccount = await fetchUser(companyId);
  const isNormalOrder = orderType === EOrderType.normal;

  const initialMemberOrder = await getInitMemberOrder({
    companyAccount,
    selectedGroups,
  });

  let currPlan: PlanListing;

  const normalizeDetail = getNormalizeDetail({
    orderDetail,
    initialMemberOrder,
    isNormalOrder,
  });

  let updatedOrderDetail = normalizeDetail;

  if (enabledToUpdateRelatedBookingInfo) {
    currPlan = await fetchListing(planId as string);
    const { orderDetail: oldOrderDetail = {}, menuIds = [] } = Listing(
      currPlan as any,
    ).getMetadata();

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

    const planListing: PlanListing =
      denormalisedResponseEntities(planListingResponse)[0];

    sendRestaurantChangedSlackNotification(orderListing, normalizeDetail);

    return planListing;
  }

  return {};
};

export default updatePlan;
