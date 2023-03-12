import { denormalisedResponseEntities } from '@utils/data';

import { getIntegrationSdk } from './integrationSdk';

export const fetchListing = async (listingId: string) => {
  const integrationSdk = getIntegrationSdk();
  const response = await integrationSdk.listings.show(
    {
      id: listingId,
    },
    { expand: true },
  );
  return denormalisedResponseEntities(response)[0];
};

export const fetchUser = async (userId: string) => {
  const integrationSdk = getIntegrationSdk();
  const response = await integrationSdk.users.show(
    {
      id: userId,
      include: ['profileImage'],
    },
    { expand: true },
  );
  return denormalisedResponseEntities(response)[0];
};
