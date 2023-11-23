const flexIntegrationSdk = require('sharetribe-flex-integration-sdk');
const config = require('./config');

const createInstance = () => {
  try {
    console.info('💫 > init IntegrationSdk instance');
    const instance = flexIntegrationSdk.createInstance({
      ...config.integrationSdk,
    });

    return instance;
  } catch (error) {
    console.error('💫 > error init IntegrationSdk instance');
    console.error(error);

    return null;
  }
};

const instance = createInstance();

const getIntegrationSdk = () => {
  if (typeof instance !== 'undefined' && instance !== null) {
    return instance;
  }

  return createInstance();
};

module.exports = getIntegrationSdk;
