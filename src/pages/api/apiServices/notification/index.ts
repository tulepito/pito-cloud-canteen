import { fetchListing } from '@services/integrationHelper';
import { createFirebaseDocNotification } from '@services/notifications';
import { Listing } from '@src/utils/data';
import { ENotificationType, EOrderStates } from '@src/utils/enums';

export const sendNotificationToParticipantOnUpdateOrder = async (
  orderId: string,
) => {
  try {
    const order = await fetchListing(orderId);
    const { participants = [], orderState } = Listing(order).getMetadata();

    const { title: orderTitle } = Listing(order).getAttributes();

    switch (orderState) {
      case EOrderStates.picking: {
        // create order picking notification for all participants
        await Promise.all(
          participants.map(async (participantId: string) =>
            createFirebaseDocNotification(ENotificationType.ORDER_PICKING, {
              orderId,
              orderTitle,
              userId: participantId,
            }),
          ),
        );
      }

      // eslint-disable-next-line no-fallthrough
      default:
    }
  } catch (error) {
    console.error(
      '[API-REQUEST-ERROR]: sendNotificationToParticipantOnUpdateOrder: ',
      error,
    );
  }
};
