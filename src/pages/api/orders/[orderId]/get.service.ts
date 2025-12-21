/* eslint-disable @typescript-eslint/no-shadow */
import chunk from 'lodash/chunk';
import flatten from 'lodash/flatten';
import isEmpty from 'lodash/isEmpty';

import { queryAllListings } from '@helpers/apiHelpers';
import { fetchListing, fetchUser } from '@services/integrationHelper';
import { getIntegrationSdk } from '@services/integrationSdk';
import { EImageVariants } from '@src/utils/enums';
import { denormalisedResponseEntities, Listing } from '@utils/data';
import type { TPlan } from '@utils/orderTypes';
import type { TListing, TObject } from '@utils/types';

const cleanPrivateData = (user: TObject) => {
  if (!user || typeof user !== 'object') return user;

  const attributes = user.attributes || {};
  const profile = attributes.profile || {};
  const originalPrivateData = profile.privateData || {};

  // eslint-disable-next-line unused-imports/no-unused-vars
  const { password, username, ...safePrivateData } = originalPrivateData;

  return {
    ...user,
    attributes: {
      ...attributes,
      profile: {
        ...profile,
        privateData: safePrivateData,
      },
    },
  };
};

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
    removedParticipants = [],
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
  ).map((item) => cleanPrivateData(item));

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
  ).map((item) => cleanPrivateData(item));

  const removedParticipantData = flatten(
    await Promise.all(
      chunk(removedParticipants, 100).map(async (ids) => {
        return denormalisedResponseEntities(
          await integrationSdk.users.query({
            meta_id: ids,
            include: ['profileImage'],
            'fields.image': [`variants.${EImageVariants.squareSmall2x}`],
          }),
        );
      }),
    ),
  ).map((item) => cleanPrivateData(item));

  data = {
    ...data,
    participantData,
    anonymousParticipantData,
    removedParticipantData,
  };

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

export const getOrderAndPlan = async (orderIds: string[]) => {
  const orders: [] = await queryAllListings({
    query: {
      ids: orderIds,
    },
  });
  const plainIds: string[] = [];
  orders.forEach((order: TListing) => {
    const { plans = [] } = Listing(order).getMetadata();

    if (plans?.length > 0) {
      const planId = plans[0];
      plainIds.push(planId);
    }
  });
  const plans: [] = await queryAllListings({
    query: {
      ids: plainIds,
    },
  });

  const mapPlanByOrderId = plans.reduce((acc, plan: TListing) => {
    const { orderId } = Listing(plan).getMetadata();
    if (!acc.has(orderId)) {
      acc.set(orderId, plan);
    }

    return acc;
  }, new Map<string, any>());

  return orders.map((order: TListing) => {
    const orderId = Listing(order).getId();

    return {
      orderListing: order,
      planListing: mapPlanByOrderId.get(orderId),
    };
  });
};
export default getOrder;
