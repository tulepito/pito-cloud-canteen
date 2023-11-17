require('dotenv').config();

const bookingProcessAlias = 'sub-order-transaction-process/release-2';

const sdkClientId = process.env.SHARETRIBE_SDK_CLIENT_ID || '';
const sdkBaseUrl = process.env.SHARETRIBE_SDK_BASE_URL || '';
const sdkAssetCdnBaseUrl = process.env.SHARETRIBE_SDK_ASSET_CDN_BASE_URL || '';
const sdkTransitVerbose = process.env.SHARETRIBE_SDK_TRANSIT_VERBOSE === 'true';

// Canonical root url is needed in social media sharing and SEO optimization purposes.
const canonicalRootURL = process.env.CANONICAL_ROOT_URL;

// If webapp is using SSL (i.e. it's behind 'https' protocol)
const usingSSL = process.env.SHARETRIBE_USING_SSL === 'true';

// Integration
const integrationSdkClientId = process.env.FLEX_INTEGRATION_CLIENT_ID;
const integrationSdkClientSecret = process.env.FLEX_INTEGRATION_CLIENT_SECRET;

const {
  FIREBASE_NOTIFICATION_COLLECTION_NAME,
  FIREBASE_PAYMENT_RECORD_COLLECTION_NAME,
} = process.env;

const ADMIN_ID = process.env.PITO_ADMIN_ID || '';

const config = {
  bookingProcessAlias,
  adminId: ADMIN_ID,
  sdk: {
    clientId: sdkClientId,
    baseUrl: sdkBaseUrl,
    assetCdnBaseUrl: sdkAssetCdnBaseUrl,
    transitVerbose: sdkTransitVerbose,
  },
  integrationSdk: {
    clientId: integrationSdkClientId,
    clientSecret: integrationSdkClientSecret,
  },
  firebase: {
    notificationCollectionName: FIREBASE_NOTIFICATION_COLLECTION_NAME,
    paymentRecordCollectionName: FIREBASE_PAYMENT_RECORD_COLLECTION_NAME,
    config: {
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: `${process.env.FIREBASE_PROJECT_ID}.firebaseapp.com`,
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: `${process.env.FIREBASE_PROJECT_ID}.appspot.com`,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.FIREBASE_APP_ID,
      measurementId: process.env.FIREBASE_MEASURE_ID,
    },
  },
  ses: {
    config: {
      accessKeyId: `${process.env.AWS_SES_ACCESS_KEY_ID}`,
      secretAccessKey: `${process.env.AWS_SES_SECRET_ACCESS_KEY}`,
      region: `${process.env.AWS_SES_REGION}`,
      apiVersion: '2010-12-01',
    },
    senderEmail: process.env.AWS_SES_SENDER_EMAIL,
  },
  oneSignal: {
    appId: process.env.ONE_SIGNAL_APP_ID,
    apiKey: process.env.ONE_SIGNAL_API_KEY,
  },
  canonicalRootURL,
  encryptPasswordSecretKey: process.env.ENCRYPT_PASSWORD_SECRET_KEY,
  allowPartnerEmailSend: process.env.ALLOW_PARTNER_EMAIL_SEND === 'true',
  usingSSL,
};
console.debug('💫 > config: ', config);

module.exports = config;
