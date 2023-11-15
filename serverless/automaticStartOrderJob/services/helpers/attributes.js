const getIntegrationSdk = require('../../utils/integrationSdk');
const { denormalisedResponseEntities, User } = require('../../utils/data');

const ADMIN_ID = process.env.PITO_ADMIN_ID || '';

const integrationSdk = getIntegrationSdk();

const getAdminAccount = async () => {
  const [adminAccount] = denormalisedResponseEntities(
    await integrationSdk.users.show({ id: ADMIN_ID }),
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

module.export = {
  getSystemAttributes,
};
