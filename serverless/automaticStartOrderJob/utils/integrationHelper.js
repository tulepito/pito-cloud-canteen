const getIntegrationSdk = require('./integrationSdk');
const { denormalisedResponseEntities } = require('./data');

const fetchTransaction = async (transactionId, include = []) => {
  const integrationSdk = getIntegrationSdk();

  const response = await integrationSdk.transactions.show({
    id: transactionId,
    include,
  });

  return denormalisedResponseEntities(response)[0];
};

const fetchListing = async (listingId, include, imageVariants) => {
  const integrationSdk = getIntegrationSdk();
  const response = await integrationSdk.listings.show({
    id: listingId,
    include,
    ...(imageVariants && { 'fields.image': imageVariants }),
  });

  return denormalisedResponseEntities(response)[0];
};

const fetchUser = async (userId) => {
  const integrationSdk = getIntegrationSdk();
  const response = await integrationSdk.users.show({
    id: userId,
    include: ['profileImage'],
    'fields.image': [
      'variants.square-small',
      'variants.square-small2x',
      'variants.default',
    ],
  });

  return denormalisedResponseEntities(response)[0];
};

const fetchUserByEmail = async (email) => {
  const integrationSdk = getIntegrationSdk();
  const response = await integrationSdk.users.show({
    email,
    include: ['profileImage'],
  });

  return denormalisedResponseEntities(response)[0];
};

const queryListings = async (params, include = [], imageVariants = []) => {
  const integrationSdk = getIntegrationSdk();
  const response = await integrationSdk.listings.query({
    ...params,
    include,
    ...(imageVariants && { 'fields.image': imageVariants }),
  });

  return denormalisedResponseEntities(response);
};

module.exports = {
  fetchTransaction,
  fetchListing,
  fetchUser,
  fetchUserByEmail,
  queryListings,
};
