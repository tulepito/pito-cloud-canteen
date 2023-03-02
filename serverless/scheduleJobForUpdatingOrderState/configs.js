require('dotenv').config();

const flexIntegrationSdkConfig = {
  clientId: process.env.FLEX_INTEGRATION_CLIENT_ID,
  clientSecret: process.env.FLEX_INTEGRATION_CLIENT_SECRET,
};

const eventTriggerUserId = process.env.EVENT_TRIGGER_USER_ID;

module.exports = {
  flexIntegrationSdkConfig,
  eventTriggerUserId,
};
