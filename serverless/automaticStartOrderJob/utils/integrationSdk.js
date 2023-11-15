const flexIntegrationSdk = require('sharetribe-flex-integration-sdk');
const config = require('./config');

const getIntegrationSdk = () => {
  return flexIntegrationSdk.createInstance({
    ...config.integrationSdk,
  });
};

module.exports = getIntegrationSdk;
