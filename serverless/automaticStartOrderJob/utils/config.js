const bookingProcessAlias = 'sub-order-transaction-process/release-2';

const sdkClientId = process.env.SHARETRIBE_SDK_CLIENT_ID || '';
const sdkBaseUrl = process.env.SHARETRIBE_SDK_BASE_URL || '';
const sdkAssetCdnBaseUrl = process.env.SHARETRIBE_SDK_ASSET_CDN_BASE_URL || '';
const sdkTransitVerbose = process.env.SHARETRIBE_SDK_TRANSIT_VERBOSE === 'true';

// Canonical root url is needed in social media sharing and SEO optimization purposes.
const canonicalRootURL = process.env.CANONICAL_ROOT_URL;

// If webapp is using SSL (i.e. it's behind 'https' protocol)
const usingSSL = process.env.SHARETRIBE_USING_SSL === 'true';

const marketplacePhoneNumber = '1900 252 530';

const config = {
  bookingProcessAlias,
  sdk: {
    clientId: sdkClientId,
    baseUrl: sdkBaseUrl,
    assetCdnBaseUrl: sdkAssetCdnBaseUrl,
    transitVerbose: sdkTransitVerbose,
  },
  canonicalRootURL,
  usingSSL,
  marketplacePhoneNumber,
};

export default config;
