/* eslint-disable @typescript-eslint/no-shadow */
import isEmpty from 'lodash/isEmpty';

import { fetchListing, fetchUser } from '@services/integrationHelper';
import { getIntegrationSdk } from '@services/integrationSdk';
import { denormalisedResponseEntities, Listing } from '@utils/data';
import type { TPlan } from '@utils/orderTypes';
import type { TObject } from '@utils/types';

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
  const participantData = denormalisedResponseEntities(
    await integrationSdk.users.query({
      ids: participants,
    }),
  );
  const anonymousParticipantData = denormalisedResponseEntities(
    await integrationSdk.users.query({
      ids: anonymous,
    }),
  );

  data = { ...data, participantData, anonymousParticipantData };

  if (plans?.length > 0) {
    const planId = plans[0];
    const planListing = await fetchListing(planId);

    data = { ...data, planListing };

    const { orderDetail } = Listing(planListing).getMetadata();
    const orderDetailEntries =
      Object.entries<TPlan['orderDetail'][keyof TPlan['orderDetail']]>(
        orderDetail,
      );

    const restaurantIds = orderDetailEntries
      .reduce<string[]>((prev, [, { restaurant }]) => {
        if (restaurant && restaurant?.id) return prev.concat(restaurant?.id);

        return prev;
      }, [])
      .filter((d, index, array) => array.indexOf(d) === index);

    const restaurantData = denormalisedResponseEntities(
      (await integrationSdk.listings.query({
        ids: restaurantIds.join(','),
        include: ['author'],
      })) || [{}],
    );

    data = { ...data, restaurantData };
  }

  if (!isEmpty(bookerId)) {
    const bookerData = await fetchUser(bookerId);

    data = { ...data, bookerData };
  }

  return data;
};

export default getOrder;
