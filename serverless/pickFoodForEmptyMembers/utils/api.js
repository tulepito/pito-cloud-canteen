const chunk = require('lodash/chunk');
const flatten = require('lodash/flatten');
const { denormalisedResponseEntities } = require('./data');

const fetchListingsByChunkedIds = async (ids, sdk, expand = {}) => {
  const listingsResponse = await Promise.all(
    chunk(ids, 100).map(async (_ids) => {
      const response = await sdk.listings.query({
        ids: _ids,
        ...expand,
      });

      return denormalisedResponseEntities(response);
    }),
  );

  return flatten(listingsResponse);
};

const fetchUserByChunkedIds = async (ids, sdk) => {
  const usersResponse = await Promise.all(
    chunk(ids, 100).map(async (_ids) => {
      const response = await sdk.users.query({
        meta_id: _ids,
      });

      return denormalisedResponseEntities(response);
    }),
  );

  return flatten(usersResponse);
};

module.exports = {
  fetchListingsByChunkedIds,
  fetchUserByChunkedIds,
};
