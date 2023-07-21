const { denormalisedResponseEntities } = require('./data');
const { getIntegrationSdk } = require('./sdk');

const calculateRemainPages = (meta) => {
  const { totalPages = 1 } = meta;
  if (totalPages <= 1) return [];
  return new Array(totalPages - 1).fill(0).map((_v, i) => i + 2);
};

const queryAllPages = async ({
  sdkModel,
  query,
  include,
  pagesPerRequest = 100,
  fields = {},
}) => {
  let result = [];
  const queryPage = async ({ page }) => {
    const response = await sdkModel.query({
      include,
      page,
      pagesPerRequest,
      ...fields,
      ...query,
    });

    result = [...result, ...denormalisedResponseEntities(response)];
    return response;
  };

  // query first page to get meta
  const firstResponse = await queryPage({ page: 1 });
  const { meta } = firstResponse.data;
  const remainPages = calculateRemainPages(meta);

  if (remainPages.length) {
    await Promise.all(remainPages.map((page) => queryPage({ page })));
    return result;
  }

  return result;
};

const queryAllListings = async ({ query, include = [] } = {}) => {
  return queryAllPages({
    sdkModel: getIntegrationSdk().listings,
    include,
    query,
  });
};

module.exports = {
  queryAllPages,
  queryAllListings,
};
