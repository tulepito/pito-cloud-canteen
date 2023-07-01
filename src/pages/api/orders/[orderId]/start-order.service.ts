import { denormalisedResponseEntities } from '@services/data';
import { emailSendingFactory, EmailTemplateTypes } from '@services/email';
import { getIntegrationSdk } from '@services/integrationSdk';
import { Listing } from '@utils/data';
import { EOrderStates } from '@utils/enums';

export const startOrder = async (orderId: string) => {
  const integrationSdk = getIntegrationSdk();

  const [orderListing] = denormalisedResponseEntities(
    await integrationSdk.listings.show({
      id: orderId,
    }),
  );
  const { orderState, orderStateHistory = [] } =
    Listing(orderListing).getMetadata();

  if (orderState !== EOrderStates.picking) {
    throw new Error('You can start order (with orderState is "picking") only');
  }

  const updateOrderStateHistory = orderStateHistory.concat([
    {
      state: EOrderStates.inProgress,
      updatedAt: new Date().getTime(),
    },
  ]);

  await integrationSdk.listings.update(
    {
      id: orderId,
      metadata: {
        orderState: EOrderStates.inProgress,
        orderStateHistory: updateOrderStateHistory,
      },
    },
    { expand: true },
  );

  emailSendingFactory(EmailTemplateTypes.BOOKER.BOOKER_ORDER_SUCCESS, {
    orderId,
  });
};
