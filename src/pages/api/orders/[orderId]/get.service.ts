import { getIntegrationSdk } from '@services/integrationSdk';
import { denormalisedResponseEntities } from '@utils/data';
import type { TObject } from '@utils/types';
import get from 'lodash/get';

const getOrder = async ({ orderId }: { orderId: string }) => {
  const integrationSdk = getIntegrationSdk();

  const orderResponse = await integrationSdk.listings.show({
    id: orderId,
  });
  const [orderListing] = denormalisedResponseEntities(orderResponse);
  const {
    plans = [],
    companyId,
    participants = [],
  } = get(orderListing, 'attributes.metadata', {});

  const companyResponse = await integrationSdk.users.show({
    id: companyId,
  });
  const [companyUser] = denormalisedResponseEntities(companyResponse);

  let data: TObject = { companyId, companyData: companyUser };
  const participantData = await Promise.all(
    participants.map(async (id: string) => {
      const [memberAccount] = denormalisedResponseEntities(
        await integrationSdk.users.show({
          id,
        }),
      );

      return memberAccount;
    }),
  );

  data = { ...data, participantData };

  if (plans?.length > 0) {
    const planId = plans[0];
    const [planListing] = denormalisedResponseEntities(
      await integrationSdk.listings.show({
        id: planId,
      }),
    );

    data = { ...data, orderListing, planListing };
  }
  return data;
};

export default getOrder;
