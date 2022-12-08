const env = process.env.NEXT_PUBLIC_ENV;
const dev = process.env.NEXT_PUBLIC_ENV === 'development';

// CDN assets for the app. Configurable through Flex Console.
// Currently, only translation.json is available.
// Note: the path must match the path defined in Asset Delivery API
const appCdnAssets = {
  translations: 'content/translations.json',
};

// If you want to change the language, remember to also change the
// locale data and the messages in the app.js file.
const locale = 'vi';
const i18n = {
  /*
    0: Sunday
    1: Monday
    ...
    6: Saturday
  */
  firstDayOfWeek: 0,
};

// To pass environment variables to the client app in the build
// script, react-scripts (and the sharetribe-scripts fork of
// react-scripts) require using the NEXT_PUBLIC_ prefix to avoid
// exposing server secrets to the client side.
const sdkClientId = process.env.NEXT_PUBLIC_SHARETRIBE_SDK_CLIENT_ID || '';
const sdkBaseUrl = process.env.NEXT_PUBLIC_SHARETRIBE_SDK_BASE_URL || '';
const sdkAssetCdnBaseUrl =
  process.env.NEXT_PUBLIC_SHARETRIBE_SDK_ASSET_CDN_BASE_URL || '';
const sdkTransitVerbose =
  process.env.NEXT_PUBLIC_SHARETRIBE_SDK_TRANSIT_VERBOSE === 'true';

// Canonical root url is needed in social media sharing and SEO optimization purposes.
const canonicalRootURL = process.env.NEXT_PUBLIC_CANONICAL_ROOT_URL;

// If webapp is using SSL (i.e. it's behind 'https' protocol)
const usingSSL = process.env.REACT_APP_SHARETRIBE_USING_SSL === 'true';

// Site title is needed in meta tags (bots and social media sharing reads those)
const siteTitle = 'PITO';

// Twitter handle is needed in meta tags (twitter:site). Start it with '@' character
const siteTwitterHandle = '@sharetribe';

// Instagram page is used in SEO schema (http://schema.org/Organization)
const siteInstagramPage = null;

// Facebook page is used in SEO schema (http://schema.org/Organization)
const siteFacebookPage = 'https://www.facebook.com/Sharetribe/';

// Note: Facebook app id is also used for tracking:
// Facebook counts shares with app or page associated by this id
// Currently it is unset, but you can read more about fb:app_id from
// https://developers.facebook.com/docs/sharing/webmasters#basic
// You should create one to track social sharing in Facebook
const facebookAppId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;

// NOTE: only expose configuration that should be visible in the
// client side, don't add any server secrets in this file.
const config = {
  env,
  dev,
  appCdnAssets,
  locale,
  i18n,
  sdk: {
    clientId: sdkClientId,
    baseUrl: sdkBaseUrl,
    assetCdnBaseUrl: sdkAssetCdnBaseUrl,
    transitVerbose: sdkTransitVerbose,
  },
  canonicalRootURL,
  siteTitle,
  siteFacebookPage,
  siteInstagramPage,
  siteTwitterHandle,
  facebookAppId,
  usingSSL,
};

export default config;
