require('dotenv').config();

const canonicalRootURL = process.env.CANONICAL_ROOT_URL;

// Integration
const integrationSdkClientId = process.env.FLEX_INTEGRATION_CLIENT_ID;
const integrationSdkClientSecret = process.env.FLEX_INTEGRATION_CLIENT_SECRET;

const { FIREBASE_PARTICIPANT_SUB_ORDER_COLLECTION_NAME } = process.env;

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
    participantSubOrderCollectionName:
      FIREBASE_PARTICIPANT_SUB_ORDER_COLLECTION_NAME,
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
};
