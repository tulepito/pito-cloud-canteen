import { fetchUser } from './integrationHelper';

const ADMIN_ID = process.env.PITO_ADMIN_ID || '';
const getAdminAccount = async () => {
  const adminAccount = await fetchUser(ADMIN_ID);

  return adminAccount;
};

export default getAdminAccount;
