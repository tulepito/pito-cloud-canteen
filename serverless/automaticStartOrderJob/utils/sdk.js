const { createInstance, transit, types, util } = require('sharetribe-flex-sdk');
const sharetribeSdk = require('sharetribe-flex-sdk');
const Decimal = require('decimal.js');
const config = require('./config');

const baseUrlMaybe = config.sdk.baseUrl ? { baseUrl: config.sdk.baseUrl } : {};

const CLIENT_ID = process.env.SHARETRIBE_SDK_CLIENT_ID;
const CLIENT_SECRET = process.env.SHARETRIBE_SDK_CLIENT_SECRET;
const TRANSIT_VERBOSE = process.env.SHARETRIBE_SDK_TRANSIT_VERBOSE === 'true';

const createSdkInstance = () =>
  createInstance({
    clientId: config.sdk.clientId,
    transitVerbose: config.sdk.transitVerbose,
    secure: config.usingSSL,
    ...baseUrlMaybe,
  });

// Application type handlers for JS SDK.
//
// NOTE: keep in sync with `typeHandlers` in `src/util/api.js`
const typeHandlers = [
  // Use Decimal type instead of SDK's BigDecimal.
  {
    type: sharetribeSdk.types.BigDecimal,
    customType: Decimal,
    writer: (v) => new sharetribeSdk.types.BigDecimal(v.toString()),
    reader: (v) => new Decimal(v.value),
  },
];

const memoryStore = (token) => {
  const store = sharetribeSdk.tokenStore.memoryStore();
  store.setToken(token);

  return store;
};

const getTrustedSdkWithSubAccountToken = (userToken) => {
  // Initiate an SDK instance for token exchange
  const sdk = sharetribeSdk.createInstance({
    transitVerbose: TRANSIT_VERBOSE,
    clientId: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    tokenStore: memoryStore(userToken),
    typeHandlers,
    ...baseUrlMaybe,
  });

  // Perform a token exchange
  return sdk.exchangeToken().then((response) => {
    // Setup a trusted sdk with the token we got from the exchange:
    const trustedToken = response.data;

    return sharetribeSdk.createInstance({
      transitVerbose: TRANSIT_VERBOSE,

      // We don't need CLIENT_SECRET here anymore
      clientId: CLIENT_ID,

      // Important! Do not use a cookieTokenStore here but a memoryStore
      // instead so that we don't leak the token back to browser client.
      tokenStore: memoryStore(trustedToken),

      typeHandlers,
      ...baseUrlMaybe,
    });
  });
};

export {
  getTrustedSdkWithSubAccountToken,
  createSdkInstance,
  transit,
  types,
  util,
};
