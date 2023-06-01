import isEmpty from 'lodash/isEmpty';

import { denormalisedResponseEntities } from '@services/data';
import { getIntegrationSdk } from '@services/integrationSdk';
import { createFirebaseDocNotification } from '@services/notifications';
import type { TPlan } from '@src/utils/orderTypes';
import { Listing } from '@utils/data';
import {
  EBookerOrderDraftStates,
  ENotificationType,
  EOrderDraftStates,
  EOrderStates,
} from '@utils/enums';

const enableToPublishOrderStates = [
  EOrderDraftStates.pendingApproval,
  EBookerOrderDraftStates.bookerDraft,
];

const normalizePlanDetailsData = (planDetails: TPlan['orderDetail']) => {
  return Object.entries(planDetails).reduce((prev, [date, planDataOnDate]) => {
    const { restaurant } = planDataOnDate;

    const { id, restaurantName, foodList } = restaurant;
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
  } = orderListing.getMetadata();
  const { title: orderTitle } = orderListing.getAttributes();

  if (!enableToPublishOrderStates.includes(orderState)) {
    throw new Error(`Invalid orderState, ${orderState}`);
  }

  if (isEmpty(plans)) {
    throw new Error(`No plan was set up`);
  }

  const [planId] = plans;
  const [planListing] = denormalisedResponseEntities(
    await integrationSdk.listings.show({ id: planId }),
  );
  const { orderDetail: planOrderDetails } = Listing(planListing).getMetadata();

  await integrationSdk.listings.update({
    id: planId,
    metadata: {
      orderDetail: normalizePlanDetailsData(planOrderDetails),
    },
  });

  await integrationSdk.listings.update({
    id: orderId,
    metadata: {
      orderState: EOrderStates.picking,
      orderStateHistory: orderStateHistory.concat({
        state: EOrderStates.picking,
        updatedAt: new Date().getTime(),
      }),
    },
  });

  // create order picking notification for all participants
  participants.map(async (participantId: string) => {
    createFirebaseDocNotification(ENotificationType.ORDER_PICKING, {
      orderId,
      orderTitle,
      userId: participantId,
    });
  });
};
