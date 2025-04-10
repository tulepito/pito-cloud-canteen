import { useMemo } from 'react';

import logger from '@helpers/logger';

import { createSdkInstance } from './sdk';

logger.info('useClientSdkInstance', 'Accessing Sharetribe client SDK instance');
class GlobalInstanceHolder {
  private globalInstanceHolder: Map<string, any>;

  constructor() {
    logger.info('GlobalInstanceHolder', 'Initializing global instance holder');
    this.globalInstanceHolder = new Map();
  }

  get(key: string) {
    return this.globalInstanceHolder.get(key);
  }

  set(key: string, value: any) {
    this.globalInstanceHolder.set(key, value);
  }
}

const globalCache = new GlobalInstanceHolder();
export default globalCache;

export const useClientSdkInstance = () => {
  const sdk = useMemo(() => {
    const cacheKey = 'client-sdk-instance';
    let sdkInstance = globalCache.get(cacheKey);

    if (!sdkInstance) {
      logger.info(
        'SDK instance',
        'Creating new Sharetribe client SDK instance',
      );
      sdkInstance = createSdkInstance();
      globalCache.set(cacheKey, sdkInstance);
    } else {
      logger.info(
        'SDK instance',
        'Using existing Sharetribe client SDK instance',
      );
    }

    return sdkInstance;
  }, []);

  return sdk;
};
