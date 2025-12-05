require('dotenv').config();

const canonicalRootURL = process.env.CANONICAL_ROOT_URL;

// Integration
const integrationSdkClientId = process.env.FLEX_INTEGRATION_CLIENT_ID;
const integrationSdkClientSecret = process.env.FLEX_INTEGRATION_CLIENT_SECRET;

module.exports = {
  integrationSdk: {
    clientId: integrationSdkClientId,
    clientSecret: integrationSdkClientSecret,
  },
  firebase: {
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
  slack: {
    webhookUrl: process.env.SLACK_WEBHOOK_URL_FOR_ORDER_CHANGE_LOG,
    enabled: process.env.SLACK_WEBHOOK_ENABLED,
  },
  canonicalRootURL,
};
