import defaultLocationSearches from '@helpers/defaultLocationSearches';

const env = process.env.NEXT_PUBLIC_ENV;
const dev = process.env.NEXT_PUBLIC_ENV === 'development';

// CDN assets for the app. Configurable through Flex Console.
// Currently, only translation.json is available.
// Note: the path must match the path defined in Asset Delivery API
const appCdnAssets = {
  translations: 'content/translations.json',
};

const bookingProcessAlias = 'sub-order-transaction-process/release-2';

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
const usingSSL = process.env.NEXT_PUBLIC_SHARETRIBE_USING_SSL === 'true';

// Site title is needed in meta tags (bots and social media sharing reads those)
const siteTitle = 'PITO';

// Twitter handle is needed in meta tags (twitter:site). Start it with '@' character
const siteTwitterHandle = '@sharetribe';

// Instagram page is used in SEO schema (http://schema.org/Organization)
const siteInstagramPage = 'https://www.instagram.com/pito.vn/';

// Facebook page is used in SEO schema (http://schema.org/Organization)
const siteFacebookPage = 'https://www.facebook.com/PITO.vn/';

// LinkedIn page is used in SEO schema (http://schema.org/Organization)

const siteLinkedInPage = 'https://www.linkedin.com/company/pito-vn/';

// Note: Facebook app id is also used for tracking:
// Facebook counts shares with app or page associated by this id
// Currently it is unset, but you can read more about fb:app_id from
// https://developers.facebook.com/docs/sharing/webmasters#basic
// You should create one to track social sharing in Facebook
const facebookAppId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;

// NOTE: only expose configuration that should be visible in the
// client side, don't add any server secrets in this file.

const maps = {
  // mapboxAccessToken: process.env.REACT_APP_MAPBOX_ACCESS_TOKEN,
  googleMapsAPIKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,

  // The location search input can be configured to show default
  // searches when the user focuses on the input and hasn't yet typed
  // anything. This reduces typing and avoids too many Geolocation API
  // calls for common searches.
  search: {
    // When enabled, the first suggestion is "Current location" that
    // uses the browser Geolocation API to query the user's current
    // location.
    suggestCurrentLocation:
      process.env.REACT_APP_DEFAULT_SEARCHES_ENABLED === 'true',

    // Distance in meters for calculating the bounding box around the
    // current location.
    currentLocationBoundsDistance: 1000,

    // Example location can be edited in the
    // `default-location-searches.js` file.
    defaults:
      process.env.REACT_APP_DEFAULT_SEARCHES_ENABLED === 'true'
        ? defaultLocationSearches
        : [],

    // Limit location autocomplete to a one or more countries
    // using ISO 3166 alpha 2 country codes separated by commas.
    // If you want to limit the autocomplete, uncomment this value:
    countryLimit: ['VN'],
  },

  // When fuzzy locations are enabled, coordinates on maps are
  // obfuscated randomly around the actual location.
  //
  // NOTE: This only hides the locations in the UI level, the actual
  // coordinates are still accessible in the HTTP requests and the
  // Redux store.
  fuzzy: {
    enabled: false,

    // Amount of maximum offset in meters that is applied to obfuscate
    // the original coordinates. The actual value is random, but the
    // obfuscated coordinates are withing a circle that has the same
    // radius as the offset.
    offset: 500,

    // Default zoom level when showing a single circle on a Map. Should
    // be small enough so the whole circle fits in.
    defaultZoomLevel: 13,

    // Color of the circle on the Map component.
    circleColor: '#c0392b',
  },

  // Custom marker image to use in the Map component.
  //
  // NOTE: Not used if fuzzy locations are enabled.
  customMarker: {
    enabled: false,

    // Publicly accessible URL for the custom marker image.
    //
    // The easiest place is /public/static/icons/ folder, but then the
    // marker image is not available while developing through
    // localhost.
    url: encodeURI(`${canonicalRootURL}/static/icons/map-marker-32x32.png`),

    // Dimensions of the marker image.
    width: 32,
    height: 32,

    // Position to anchor the image in relation to the coordinates,
    // ignored when using Mapbox.
    anchorX: 16,
    anchorY: 32,
  },
};

const deadlineTimeOptions = [
  '07:00',
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
];

const VATPercentage = 0;

const marketplacePhoneNumber = '1900 252 530';

const maxKilometerFromRestaurantToDeliveryAddressForBooker =
  process.env
    .NEXT_PUBLIC_MAX_KILOMETER_FROM_RESTAURANT_TO_DELIVERY_ADDRESS_FOR_BOOKER;

const config = {
  env,
  dev,
  appCdnAssets,
  bookingProcessAlias,
  locale,
  i18n,
  deadlineTimeOptions,
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
  siteLinkedInPage,
  facebookAppId,
  usingSSL,
  maps,
  VATPercentage,
  marketplacePhoneNumber,
  maxKilometerFromRestaurantToDeliveryAddressForBooker,
};

export default config;
