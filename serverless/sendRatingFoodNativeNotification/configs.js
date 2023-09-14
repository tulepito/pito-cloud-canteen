require('dotenv').config();

const flexIntegrationSdkConfig = {
  clientId: process.env.FLEX_INTEGRATION_CLIENT_ID,
  clientSecret: process.env.FLEX_INTEGRATION_CLIENT_SECRET,
};

module.exports = {
  flexIntegrationSdkConfig,
};
