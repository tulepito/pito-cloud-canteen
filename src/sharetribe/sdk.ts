import { createInstance, transit, types, util } from 'sharetribe-flex-sdk';

import config from '../configs';

const baseUrl = config.sdk.baseUrl ? { baseUrl: config.sdk.baseUrl } : {};

const createSdkInstance = () =>
  createInstance({
    clientId: config.sdk.clientId,
    transitVerbose: config.sdk.transitVerbose,
    secure: config.usingSSL,
    ...baseUrl,
  });

export { createSdkInstance, transit, types, util };
