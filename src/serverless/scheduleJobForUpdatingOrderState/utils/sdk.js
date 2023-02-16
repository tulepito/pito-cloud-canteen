const flexIntegrationSdk = require('sharetribe-flex-integration-sdk');
const { denormalisedResponseEntities } = require('./data');
const { flexIntegrationSdkConfig } = require('../configs');

const integrationSdk = flexIntegrationSdk.createInstance({
  ...flexIntegrationSdkConfig,
});

const updateTxMetadata = async (transactionId, metadata) => {
  const txResponse = await integrationSdk.transactions.updateMetadata({
    id: transactionId,
    metadata,
  });

  return denormalisedResponseEntities(txResponse)[0];
};

module.exports = {
  integrationSdk,
  updateTxMetadata,
};
