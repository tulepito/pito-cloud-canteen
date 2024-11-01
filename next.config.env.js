module.exports = {
  withEnvsAssurance: (
    /** @type {import('next').NextConfig} */
    nextConfig,
  ) => {
    const envKeys = [
      'ONE_SIGNAL_APP_ID',
      'ONE_SIGNAL_API_KEY',

      'SEND_FOOD_RATING_NOTIFICATION_LAMBDA_ARN',
      'TIME_TO_SEND_FOOD_RATING_NOTIFICATION',

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
