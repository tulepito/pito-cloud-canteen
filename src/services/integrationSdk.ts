const flexIntegrationSdk = require('sharetribe-flex-integration-sdk');

const createInstance = () => {
  try {
    console.info('💫 > init IntegrationSdk instance');
    const instance = flexIntegrationSdk.createInstance({
      clientId: process.env.FLEX_INTEGRATION_CLIENT_ID,
      clientSecret: process.env.FLEX_INTEGRATION_CLIENT_SECRET,
    });

    return instance;
  } catch (error) {
    console.error('💫 > error init IntegrationSdk instance');
    console.error(error);
  }
};

const instance = createInstance();

export const getIntegrationSdk = () => {
  if (typeof instance !== 'undefined' && instance !== null) {
    return instance;
  }

  return createInstance();
};
