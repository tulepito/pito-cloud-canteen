import { User } from '@src/utils/data';

import { fetchUser } from './integrationHelper';
import { getIntegrationSdk } from './sdk';

const ADMIN_ID = process.env.PITO_ADMIN_ID || '';
const getAdminAccount = async () => {
  const adminAccount = await fetchUser(ADMIN_ID);

  return adminAccount;
};

export const getOrderNumber = async () => {
  const adminAccount = await fetchUser(ADMIN_ID);

  const { currentOrderNumber = 0 } = User(adminAccount).getMetadata();

  return currentOrderNumber;
};

export const updateOrderNumber = async () => {
  const integrationSdk = getIntegrationSdk();
  const currentOrderNumber = await getOrderNumber();
  await integrationSdk.users.updateProfile({
    id: ADMIN_ID,
    metadata: {
      currentOrderNumber: currentOrderNumber + 1,
    },
  });
};

export default getAdminAccount;
