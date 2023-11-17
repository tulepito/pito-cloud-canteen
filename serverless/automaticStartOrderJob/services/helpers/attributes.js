const getIntegrationSdk = require('../../utils/integrationSdk');
const { denormalisedResponseEntities, User } = require('../../utils/data');
const config = require('../../utils/config');

const integrationSdk = getIntegrationSdk();

const getAdminAccount = async () => {
  const [adminAccount] = denormalisedResponseEntities(
    await integrationSdk.users.show({ id: config.adminId }),
  );

  return adminAccount;
};

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

module.exports = {
  getSystemAttributes,
};
