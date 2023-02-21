import { denormalisedResponseEntities } from '@services/data';
import { getIntegrationSdk } from '@services/integrationSdk';
import { Listing } from '@utils/data';
import {
  EBookerOrderDraftStates,
  EOrderDraftStates,
  EOrderStates,
} from '@utils/enums';

const enableToPublishOrderStates = [
  EOrderDraftStates.pendingApproval,
  EBookerOrderDraftStates.bookerDraft,
];

export const publishOrder = async (orderId: string) => {
  const integrationSdk = getIntegrationSdk();

  const [orderListing] = denormalisedResponseEntities(
    await integrationSdk.listings.show({ id: orderId }),
  );

  const { orderState, orderStateHistory = [] } =
    Listing(orderListing).getMetadata();

  if (!enableToPublishOrderStates.includes(orderState)) {
    throw new Error(`Invalid orderState, ${orderState}`);
  }

  await integrationSdk.listings.update({
    metadata: {
      orderStateHistory: orderStateHistory.concat({
        state: EOrderStates.picking,
        updatedAt: new Date().getTime(),
      }),
    },
  });
};
