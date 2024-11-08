module.exports = {
  withEnvsAssurance: (
    /** @type {import('next').NextConfig} */
    nextConfig,
  ) => {
    const envKeys = [
      'ONE_SIGNAL_APP_ID',
      'ONE_SIGNAL_API_KEY',

      'NEXT_APP_FIREBASE_PROJECT_ID',
      'NEXT_APP_FIREBASE_API_KEY',
      'NEXT_APP_FIREBASE_APP_ID',
      'NEXT_APP_FIREBASE_MEASURE_ID',
      'NEXT_APP_FIREBASE_MESSAGING_SENDER_ID',

      'FIREBASE_NOTIFICATION_COLLECTION_NAME',
      'FIREBASE_PAYMENT_RECORD_COLLECTION_NAME',
      'FIREBASE_PARTICIPANT_SUB_ORDER_COLLECTION_NAME',
      'FIREBASE_SUB_ORDER_CHANGES_HISTORY_COLLECTION_NAME',

      'SEND_FOOD_RATING_NOTIFICATION_LAMBDA_ARN',
      'TIME_TO_SEND_FOOD_RATING_NOTIFICATION',

      'AWS_SES_ACCESS_KEY_ID',
      'AWS_SES_SECRET_ACCESS_KEY',
      'AWS_SES_REGION',
      'AWS_SES_SENDER_EMAIL',

      'NEXT_PUBLIC_MIXPANEL_ENABLED',
      'NEXT_PUBLIC_MIXPANEL_PROJECT_TOKEN',
      'NEXT_PUBLIC_MIXPANEL_DEBUG_ENABLED',

      'SENTRY_SOURCE_MAPS_ENABLED',
      'SENTRY_AUTH_TOKEN',
      'NEXT_PUBLIC_SENTRY_ENABLED',
      'NEXT_PUBLIC_SENTRY_ENVIRONMENT',
    ];

    envKeys.forEach((key) => {
      if (!process.env[key]) {
        throw new Error(`Missing env variable ${key}`);
      }
    });

    return nextConfig;
  },
};
