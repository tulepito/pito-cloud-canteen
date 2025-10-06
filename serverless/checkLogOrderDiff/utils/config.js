require('dotenv').config();

const canonicalRootURL = process.env.CANONICAL_ROOT_URL;

// Integration
const integrationSdkClientId = process.env.FLEX_INTEGRATION_CLIENT_ID;
const integrationSdkClientSecret = process.env.FLEX_INTEGRATION_CLIENT_SECRET;

module.exports = {
  integrationSdk: {
    clientId: integrationSdkClientId,
    clientSecret: integrationSdkClientSecret,
  },
  slack: {
    webhookUrl: process.env.SLACK_WEBHOOK_URL_FOR_ORDER_CHANGE_LOG,
    enabled: process.env.SLACK_WEBHOOK_ENABLED,
  },
  canonicalRootURL,
};
