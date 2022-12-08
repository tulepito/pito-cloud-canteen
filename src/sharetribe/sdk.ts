import { createInstance } from 'sharetribe-flex-sdk';

import config from '../config';

const baseUrl = config.sdk.baseUrl ? { baseUrl: config.sdk.baseUrl } : {};

export const sdk = createInstance({
  clientId: config.sdk.clientId,
  transitVerbose: config.sdk.transitVerbose,
  secure: config.usingSSL,
  ...baseUrl,
});
