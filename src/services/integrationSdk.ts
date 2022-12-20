const flexIntegrationSdk = require('sharetribe-flex-integration-sdk');

export const getIntegrationSdk = () => {
  return flexIntegrationSdk.createInstance({
    clientId: process.env.FLEX_INTEGRATION_CLIENT_ID,
    clientSecret: process.env.FLEX_INTEGRATION_CLIENT_SECRET,
  });
};
