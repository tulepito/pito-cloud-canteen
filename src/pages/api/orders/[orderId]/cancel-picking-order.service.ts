import { denormalisedResponseEntities } from '@services/data';
import { emailSendingFactory, EmailTemplateTypes } from '@services/email';
import { fetchListing } from '@services/integrationHelper';
import { createNativeNotification } from '@services/nativeNotification';
import { getIntegrationSdk } from '@services/sdk';
import { Listing } from '@utils/data';
import {
  ENativeNotificationType,
  EOrderStates,
  EParticipantOrderStatus,
} from '@utils/enums';

export const cancelPickingOrder = async (orderId: string) => {
  const integrationSdk = await getIntegrationSdk();
  const [orderListing] = denormalisedResponseEntities(
    await integrationSdk.listings.show({ id: orderId }),
  );

  const {
    orderState,
    orderStateHistory = [],
    plans = [],
  } = Listing(orderListing).getMetadata();

  if (orderState !== EOrderStates.picking) {
    throw new Error(`Order is not in picking state, orderState: ${orderState}`);
  }

  await integrationSdk.listings.update({
    id: orderId,
    metadata: {
      orderState: EOrderStates.canceled,
      orderStateHistory: orderStateHistory.concat({
        state: EOrderStates.canceled,
        updatedAt: new Date().getTime(),
      }),
    },
  });

  // Email for booker about order cancel
  emailSendingFactory(EmailTemplateTypes.BOOKER.BOOKER_ORDER_CANCELLED, {
    orderId,
  });

  // Email for participants about plan cancel
  Promise.all(
    plans.map(async (planId: string) => {
      const plan = await fetchListing(planId);
      const { orderDetail = {} } = Listing(plan).getMetadata();

      Promise.all(
        Object.keys(orderDetail).map((dateAsTimeStamp) => {
          const { memberOrders = {} } = orderDetail[dateAsTimeStamp];

          const participantIds: string[] = [];

          Object.keys(memberOrders).forEach((partId) => {
            const { status, foodId } = memberOrders[partId];
            if (status === EParticipantOrderStatus.joined && !!foodId) {
              participantIds.push(partId);
            }
          });

          return participantIds.forEach((participantId: string) => {
            emailSendingFactory(
              EmailTemplateTypes.PARTICIPANT.PARTICIPANT_SUB_ORDER_CANCELED,
              {
                orderId,
                timestamp: dateAsTimeStamp,
                participantId,
              },
            );
            createNativeNotification(
              ENativeNotificationType.AdminTransitSubOrderToCanceled,
              {
                participantId,
                planId,
                order: orderListing,
              },
            );
          });
        }),
      );
    }),
  );
};
