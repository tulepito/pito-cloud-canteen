module.exports = {
  withEnvsAssurance: (
    /** @type {import('next').NextConfig} */
    nextConfig,
  ) => {
    const envKeys = [
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
