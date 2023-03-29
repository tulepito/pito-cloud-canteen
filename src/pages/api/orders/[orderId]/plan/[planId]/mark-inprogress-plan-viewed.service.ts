import { denormalisedResponseEntities } from '@services/data';
import { getIntegrationSdk } from '@services/integrationSdk';
import { Listing } from '@utils/data';
import { EOrderStates } from '@utils/enums';

export const markerPlanViewed = async ({
  orderId,
  planId,
}: {
  orderId: string;
  planId: string;
}) => {
  const integrationSdk = getIntegrationSdk();

  const [orderListing] = denormalisedResponseEntities(
    await integrationSdk.listings.show({
      id: orderId,
    }),
  );
  const [planListing] = denormalisedResponseEntities(
    await integrationSdk.listings.show({
      id: planId,
    }),
  );
  const { orderState } = Listing(orderListing).getMetadata();
  const { viewed = false } = Listing(planListing).getMetadata();

  if (orderState !== EOrderStates.picking) {
    throw new Error(
      'You can mark viewed picking order (with orderState is "picking") only',
    );
  }

  if (viewed === true) {
    return;
  }

  await integrationSdk.listings.update({
    id: planId,
    metadata: {
      viewed: true,
    },
  });
};
