import { denormalisedResponseEntities } from '@services/data';
import { emailSendingFactory, EmailTemplateTypes } from '@services/email';
import getSystemAttributes from '@services/getSystemAttributes';
import { fetchUser } from '@services/integrationHelper';
import { getIntegrationSdk } from '@services/integrationSdk';
import { Listing, User } from '@utils/data';
import { EOrderStates } from '@utils/enums';

export const startOrder = async (orderId: string, planId: string) => {
  const integrationSdk = getIntegrationSdk();

  const [orderListing] = denormalisedResponseEntities(
    await integrationSdk.listings.show({
      id: orderId,
    }),
  );
  const {
    companyId,
    orderState,
    orderStateHistory = [],
    partnerIds = [],
  } = Listing(orderListing).getMetadata();

  if (orderState !== EOrderStates.picking) {
    throw new Error(
      'You can start picking order (with orderState is "picking") only',
    );
  }

  const updateOrderStateHistory = orderStateHistory.concat([
    {
      state: EOrderStates.inProgress,
      updatedAt: new Date().getTime(),
    },
  ]);
  const { systemVATPercentage = 0 } = await getSystemAttributes();
  const companyUser = await fetchUser(companyId);
  const { hasSpecificPCCFee = false, specificPCCFee = 0 } =
    User(companyUser).getMetadata();

  await integrationSdk.listings.update({
    id: orderId,
    metadata: {
      orderState: EOrderStates.inProgress,
      orderStateHistory: updateOrderStateHistory,
      orderVATPercentage: systemVATPercentage,
      hasSpecificPCCFee,
      specificPCCFee,
    },
  });

  await integrationSdk.listings.update({
    id: planId,
    metadata: {
      partnerIds,
    },
  });

  await integrationSdk.listings.update({
    id: planId,
    metadata: {
      partnerIds,
    },
  });

  emailSendingFactory(EmailTemplateTypes.BOOKER.BOOKER_ORDER_SUCCESS, {
    orderId,
  });
};
