import { difference } from 'lodash';
import isEmpty from 'lodash/isEmpty';
import uniq from 'lodash/uniq';

import { denormalisedResponseEntities } from '@services/data';
import { getIntegrationSdk } from '@services/integrationSdk';
import { createNativeNotification } from '@services/nativeNotification';
import { createFirebaseDocNotification } from '@services/notifications';
import type { TPlan } from '@src/utils/orderTypes';
import { Listing, User } from '@utils/data';
import {
  EBookerOrderDraftStates,
  ENativeNotificationType,
  ENotificationType,
  EOrderDraftStates,
  EOrderStates,
} from '@utils/enums';

const ADMIN_FLEX_ID = process.env.PITO_ADMIN_ID;

const enableToPublishOrderStates = [
  EOrderDraftStates.pendingApproval,
  EBookerOrderDraftStates.bookerDraft,
];

const normalizePlanDetailsData = (planDetails: TPlan['orderDetail']) => {
  return Object.entries(planDetails).reduce((prev, [date, planDataOnDate]) => {
    const { restaurant } = planDataOnDate || {};

    const { id, restaurantName, foodList } = restaurant || {};
    const isSetupRestaurantAndFood =
      !isEmpty(id) && !isEmpty(restaurantName) && !isEmpty(foodList);

    if (isSetupRestaurantAndFood) {
      return {
        ...prev,
        [date]: planDataOnDate,
      };
    }

    return prev;
  }, {});
};

export const publishOrder = async (orderId: string) => {
  const integrationSdk = getIntegrationSdk();

  const [order] = denormalisedResponseEntities(
    await integrationSdk.listings.show({ id: orderId }),
  );

  const orderListing = Listing(order);

  const {
    plans = [],
    orderState,
    orderStateHistory = [],
    participants = [],
    serviceFees = {},
    anonymous = [],
  } = orderListing.getMetadata();
  const { title: orderTitle } = orderListing.getAttributes();

  if (!enableToPublishOrderStates.includes(orderState)) {
    throw new Error(`Invalid orderState, ${orderState}`);
  }

  if (isEmpty(plans)) {
    throw new Error(`No plans were set up`);
  }

  const [planId] = plans;
  const [planListing] = denormalisedResponseEntities(
    await integrationSdk.listings.show({ id: planId }),
  );
  const { orderDetail: planOrderDetails = {} } =
    Listing(planListing).getMetadata();

  const normalizedOrderDetail = normalizePlanDetailsData(planOrderDetails);

  await integrationSdk.listings.update({
    id: planId,
    metadata: {
      orderDetail: normalizedOrderDetail,
    },
  });

  const response = denormalisedResponseEntities(
    await integrationSdk.users.show({
      id: ADMIN_FLEX_ID,
    }),
  )[0];
  const { systemServiceFeePercentage = 0 } = User(response).getPrivateData();

  const allRestaurantIdList = uniq(
    Object.values(normalizedOrderDetail).map(
      (subOrder: any) => subOrder?.restaurant?.id,
    ),
  );

  let newServiceFees = serviceFees;
  if (isEmpty(serviceFees)) {
    newServiceFees = allRestaurantIdList.reduce(
      (prev, restaurantId) => ({
        ...prev,
        [restaurantId]: systemServiceFeePercentage * 100,
      }),
      {},
    );
  } else {
    const diffFromOrderDetailRestaurant = difference(
      allRestaurantIdList,
      Object.keys(serviceFees),
    );

    const diffFromServiceFeesRestaurant = difference(
      Object.keys(serviceFees),
      allRestaurantIdList,
    );

    if (diffFromOrderDetailRestaurant.length > 0) {
      diffFromServiceFeesRestaurant.forEach((restaurantId) => {
        delete newServiceFees[restaurantId];
      });

      diffFromOrderDetailRestaurant.forEach((restaurantId) => {
        newServiceFees = {
          ...newServiceFees,
          [restaurantId]: systemServiceFeePercentage * 100,
        };
      });
    }
  }

  await integrationSdk.listings.update({
    id: orderId,
    metadata: {
      orderState: EOrderStates.picking,
      orderStateHistory: orderStateHistory.concat({
        state: EOrderStates.picking,
        updatedAt: new Date().getTime(),
      }),
      serviceFees: newServiceFees,
    },
  });

  // create order picking notification for all participants
  [...participants, ...anonymous].forEach((participantId: string) => {
    createFirebaseDocNotification(ENotificationType.ORDER_PICKING, {
      orderId,
      orderTitle,
      userId: participantId,
    });

    createNativeNotification(
      ENativeNotificationType.BookerTransitOrderStateToPicking,
      {
        participantId,
        order,
      },
    );
  });
};
