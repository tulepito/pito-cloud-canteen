import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: 'https://5976cc8236a8402a8da0469d3ac33ff2@o4504331075387392.ingest.us.sentry.io/4505236954284032',

  // Enable the environment and release
  environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT,
  enabled: process.env.NEXT_PUBLIC_SENTRY_ENABLED === 'true',
  debug: false,

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for tracing.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,

  // ...

  // Note: if you want to override the automatic release value, do not set a
  // `release` value here - use the environment variable `SENTRY_RELEASE`, so
  // that it will also get attached to your source maps
});
