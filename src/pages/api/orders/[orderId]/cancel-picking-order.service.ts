import { denormalisedResponseEntities } from '@services/data';
import { getIntegrationSdk } from '@services/sdk';
import { Listing } from '@utils/data';
import { EOrderStates } from '@utils/enums';

export const cancelPickingOrder = async (orderId: string) => {
  const integrationSdk = await getIntegrationSdk();

  const [orderListing] = denormalisedResponseEntities(
    await integrationSdk.listings.show({ id: orderId }),
  );

  const { orderState, orderStateHistory = [] } =
    Listing(orderListing).getMetadata();

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
};
