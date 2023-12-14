const flexIntegrationSdk = require('sharetribe-flex-integration-sdk');
const { flexIntegrationSdkConfig } = require('../configs');

const integrationSdk = flexIntegrationSdk.createInstance({
  ...flexIntegrationSdkConfig,
});

module.exports = {
  integrationSdk,
};
