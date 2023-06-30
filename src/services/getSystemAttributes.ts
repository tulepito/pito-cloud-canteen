import { User } from '@src/utils/data';

import getAdminAccount from './getAdminAccount';

const getSystemAttributes = async () => {
  const adminAccount = await getAdminAccount();

  const {
    menuTypes = [],
    categories = [],
    packaging = [],
    daySessions = [],
    nutritions = [],
  } = User(adminAccount).getMetadata();

  const { systemServiceFeePercentage, systemVATPercentage } =
    User(adminAccount).getPrivateData();

  return {
    menuTypes,
    categories,
    packaging,
    daySessions,
    nutritions,
    systemServiceFeePercentage,
    systemVATPercentage,
  };
};

export default getSystemAttributes;
