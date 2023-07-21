import type { NextApiRequest, NextApiResponse } from 'next';
import type { NextRequest } from 'next/server';

import type { TCurrentUser, TObject } from '@src/utils/types';

import { denormalisedResponseEntities } from './data';

const Decimal = require('decimal.js');
const sharetribeSdk = require('sharetribe-flex-sdk');
const flexIntegrationSdk = require('sharetribe-flex-integration-sdk');

const CLIENT_ID = process.env.NEXT_PUBLIC_SHARETRIBE_SDK_CLIENT_ID;
const CLIENT_SECRET = process.env.SHARETRIBE_SDK_CLIENT_SECRET;
const USING_SSL = process.env.NEXT_PUBLIC_SHARETRIBE_USING_SSL === 'true';
const TRANSIT_VERBOSE =
  process.env.NEXT_PUBLIC_SHARETRIBE_SDK_TRANSIT_VERBOSE === 'true';
// Application type handlers for JS SDK.
//
// NOTE: keep in sync with `typeHandlers` in `src/util/api.js`
const typeHandlers = [
  // Use Decimal type instead of SDK's BigDecimal.
  {
    type: sharetribeSdk.types.BigDecimal,
    customType: Decimal,
    writer: (v: any) => new sharetribeSdk.types.BigDecimal(v.toString()),
    reader: (v: any) => new Decimal(v.value),
  },
];

const baseUrlMaybe = process.env.NEXT_PUBLIC_SHARETRIBE_SDK_BASE_URL
  ? { baseUrl: process.env.NEXT_PUBLIC_SHARETRIBE_SDK_BASE_URL }
  : null;

const memoryStore = (token: string) => {
  const store = sharetribeSdk.tokenStore.memoryStore();
  store.setToken(token);

  return store;
};

// Read the user token from the request cookie
const getUserToken = (req: NextApiRequest) => {
  const cookieTokenStore = sharetribeSdk.tokenStore.expressCookieStore({
    clientId: CLIENT_ID,
    req,
    secure: USING_SSL,
  });

  return cookieTokenStore.getToken();
};

export const handleError = (res: NextApiResponse, error: any) => {
  if (error.status && error.statusText && error.data) {
    const { status, statusText, data } = error;

    // JS SDK error
    res.status(error.status).json({
      name: 'Local API request failed',
      status,
      statusText,
      data,
    });
  } else {
    res.status(500).json({ error: error.message });
  }
};

export const getSdk = (req: NextApiRequest | NextRequest, res: any) => {
  return sharetribeSdk.createInstance({
    transitVerbose: TRANSIT_VERBOSE,
    clientId: CLIENT_ID,
    tokenStore: sharetribeSdk.tokenStore.expressCookieStore({
      clientId: CLIENT_ID,
      req,
      res,
      secure: USING_SSL,
    }),
    typeHandlers,
    ...baseUrlMaybe,
  });
};

export const getTrustedSdk = (req: NextApiRequest) => {
  const userToken = getUserToken(req);
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
  return sdk.exchangeToken().then((response: any) => {
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

export const getTrustedSdkWithSubAccountToken = (userToken: any) => {
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
  return sdk.exchangeToken().then((response: any) => {
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

export const getIntegrationSdk = () => {
  return flexIntegrationSdk.createInstance({
    clientId: process.env.FLEX_INTEGRATION_CLIENT_ID,
    clientSecret: process.env.FLEX_INTEGRATION_CLIENT_SECRET,
  });
};

export const getCurrentUser = async (
  req: NextApiRequest,
  res: NextApiResponse,
  params: TObject = {},
) => {
  const sdk = getSdk(req, res);
  const response = await sdk.currentUser.show(params);
  const [currentUser] = denormalisedResponseEntities(response);

  return {
    currentUser: currentUser as TCurrentUser,
    response,
  };
};
