import { getIntegrationSdk } from '@services/integrationSdk';
import { denormalisedResponseEntities, Listing } from '@utils/data';
import type { TObject } from '@utils/types';
import isEmpty from 'lodash/isEmpty';

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
    anonymous = [],
    bookerId = '',
  } = Listing(orderListing).getMetadata();

  const companyResponse = await integrationSdk.users.show({
    id: companyId,
  });
  const [companyUser] = denormalisedResponseEntities(companyResponse);

  let data: TObject = { companyId, companyData: companyUser, orderListing };
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
  const anonymousParticipantData = await Promise.all(
    anonymous.map(async (id: string) => {
      const [memberAccount] = denormalisedResponseEntities(
        await integrationSdk.users.show({
          id,
        }),
      );

      return memberAccount;
    }),
  );

  data = { ...data, participantData, anonymousParticipantData };

  if (plans?.length > 0) {
    const planId = plans[0];
    const [planListing] = denormalisedResponseEntities(
      await integrationSdk.listings.show({
        id: planId,
      }),
    );

    data = { ...data, planListing };
  }

  if (!isEmpty(bookerId)) {
    const [bookerData] = denormalisedResponseEntities(
      await integrationSdk.users.show({
        id: bookerId,
      }),
    );

    data = { ...data, bookerData };
  }

  return data;
};

export default getOrder;
