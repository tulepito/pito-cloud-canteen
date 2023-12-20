/* eslint-disable @typescript-eslint/no-shadow */
import chunk from 'lodash/chunk';
import flatten from 'lodash/flatten';
import isEmpty from 'lodash/isEmpty';

import { fetchListing, fetchUser } from '@services/integrationHelper';
import { getIntegrationSdk } from '@services/integrationSdk';
import { EImageVariants } from '@src/utils/enums';
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
  const participantData = flatten(
    await Promise.all(
      chunk(participants, 100).map(async (ids) => {
        return denormalisedResponseEntities(
          await integrationSdk.users.query({
            meta_id: ids,
            include: ['profileImage'],
            'fields.image': [`variants.${EImageVariants.squareSmall2x}`],
          }),
        );
      }),
    ),
  );

  const anonymousParticipantData = flatten(
    await Promise.all(
      chunk(anonymous, 100).map(async (ids) => {
        return denormalisedResponseEntities(
          await integrationSdk.users.query({
            meta_id: ids,
            include: ['profileImage'],
            'fields.image': [`variants.${EImageVariants.squareSmall2x}`],
          }),
        );
      }),
    ),
  );

  data = { ...data, participantData, anonymousParticipantData };

  if (plans?.length > 0) {
    const planId = plans[0];
    const planListing = await fetchListing(planId);

    data = { ...data, planListing };

    const { orderDetail = {} } = Listing(planListing).getMetadata();
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

export const getOrderAndPlan = async ({ orderId }: { orderId: string }) => {
  const integrationSdk = getIntegrationSdk();

  const orderResponse = await integrationSdk.listings.show({
    id: orderId,
  });
  const [orderListing] = denormalisedResponseEntities(orderResponse);
  const { plans = [] } = Listing(orderListing).getMetadata();

  let data: TObject = { orderListing };

  if (plans?.length > 0) {
    const planId = plans[0];
    const planListing = await fetchListing(planId);

    data = { ...data, planListing };
  }

  return data;
};
export default getOrder;
