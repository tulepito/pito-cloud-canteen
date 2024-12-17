import logger from '@helpers/logger';
import type { UserListing, WithFlexSDKData } from '@src/types';
import type { TObject } from '@src/utils/types';
import { denormalisedResponseEntities } from '@utils/data';

import { getIntegrationSdk } from './integrationSdk';

export const fetchListing = async (
  listingId: string,
  include: string[] = [],
  imageVariants?: string[],
) => {
  const integrationSdk = getIntegrationSdk();
  const response = await integrationSdk.listings.show({
    id: listingId,
    include,
    ...(imageVariants && { 'fields.image': imageVariants }),
  });

  return denormalisedResponseEntities(response)[0];
};

export const adminQueryListings = async (
  params: TObject = {},
  include: string[] = [],
  imageVariants?: string[],
) => {
  const integrationSdk = getIntegrationSdk();
  const response = await integrationSdk.listings.query({
    ...params,
    include,
    ...(imageVariants && { 'fields.image': imageVariants }),
  });

  return denormalisedResponseEntities(response);
};

export const fetchUser = async (userId: string) => {
  const integrationSdk = getIntegrationSdk();
  const response = await integrationSdk.users
    .show({
      id: userId,
      include: ['profileImage'],
      'fields.image': [
        'variants.square-small',
        'variants.square-small2x',
        'variants.default',
      ],
    })
    .catch((error: any) => {
      logger.error(`Error fetching user ${userId}`, String(error));
    });

  if (!response) return null;

  return denormalisedResponseEntities(response)[0];
};

export const fetchUserListing = async (
  userId: string,
): Promise<UserListing | null> => {
  const integrationSdk = getIntegrationSdk();
  const response: WithFlexSDKData<UserListing> =
    await integrationSdk.users.show({
      id: userId,
      include: ['profileImage'],
      'fields.image': [
        'variants.square-small',
        'variants.square-small2x',
        'variants.default',
      ],
    });

  if (!response) return null;

  return response.data.data;
};

export const fetchUserByEmail = async (email: string) => {
  const integrationSdk = getIntegrationSdk();
  const response = await integrationSdk.users.show({
    email,
    include: ['profileImage'],
  });

  return denormalisedResponseEntities(response)[0];
};

export const updateUserMetadata = async (userId: string, metadata: any) => {
  const integrationSdk = getIntegrationSdk();
  const response = await integrationSdk.users.updateProfile(
    {
      id: userId,
      metadata,
    },
    { expand: true },
  );

  return denormalisedResponseEntities(response)[0];
};

export const fetchTransaction = async (
  transactionId: string,
  include: string[] = [],
) => {
  const integrationSdk = getIntegrationSdk();

  const response = await integrationSdk.transactions.show({
    id: transactionId,
    include,
  });

  return denormalisedResponseEntities(response)[0];
};

export const updateTransactionMetadata = async (
  dataParams: TObject,
  queryParams: TObject = {},
) => {
  const integrationSdk = getIntegrationSdk();

  const response = await integrationSdk.transactions.updateMetadata(
    dataParams,
    queryParams,
  );

  return denormalisedResponseEntities(response)?.[0];
};

export const queryTransactions = async (query: any, include: string[] = []) => {
  const integrationSdk = getIntegrationSdk();

  const response = await integrationSdk.transactions.query({
    ...query,
    include,
  });

  return denormalisedResponseEntities(response);
};
