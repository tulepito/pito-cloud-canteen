import { chunk, flatten } from 'lodash';
import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import cookies from '@services/cookie';
import { denormalisedResponseEntities } from '@services/data';
import { getIntegrationSdk, handleError } from '@services/sdk';
import { Listing } from '@src/utils/data';
import { EImageVariants } from '@src/utils/enums';
import type { TObject } from '@src/utils/types';

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
    companyId,
    participants = [],
    anonymous = [],
  } = Listing(orderListing).getMetadata();

  const companyResponse = await integrationSdk.users.show({
    id: companyId,
  });

  const [company] = denormalisedResponseEntities(companyResponse);

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

  const data = {
    participantData,
    anonymousParticipantData,
    company,
  };

  return data;
};

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const apiMethod = req.method;

  if (apiMethod === HttpMethod.GET) {
    try {
      const orderId = req.query.orderId as string;
      const data = await getOrder({ orderId });

      res.json({ statusCode: 200, ...data });
    } catch (error) {
      handleError(res, error);
    }
  }
}

export default cookies(handler);
