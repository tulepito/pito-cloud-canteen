const { withEnvsAssurance } = require('./next.config.env.js');
const { withSentryConfig } = require('@sentry/nextjs');

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { dirs: ['.'] },
  reactStrictMode: true,
  swcMinify: true,
  trailingSlash: true,
  i18n: {
    locales: ['vi', 'en'],
    defaultLocale: 'vi',
    localeDetection: false,
  },
  rewrites: async () => {
    return [
      { source: '/dang-ky', destination: '/sign-up' },
      { source: '/dang-nhap', destination: '/sign-in' },
      { source: '/quen-mat-khau', destination: '/forgot-password' },
      { source: '/dat-lai-mat-khau', destination: '/reset-password' },
      { source: '/xac-nhan-email', destination: '/verify-email' },
      {
        source: '/com-trua-van-phong-pito-cloud-canteen/',
        destination:
          'https://in.pito.vn/com-trua-van-phong-pito-cloud-canteen/',
      },
      {
        source: '/nang-tam-com-trua-van-phong-cho-doi-ngu/',
        destination:
          'https://in.pito.vn/nang-tam-com-trua-van-phong-cho-doi-ngu/',
      },
    ];
  },
  headers: async () => {
    return [
      {
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  pageExtensions: ['route.tsx', 'route.jsx', 'api.ts', 'api.js'],
  images: {
    domains: ['sharetribe.imgix.net', 'res.cloudinary.com'],
    unoptimized: true,
  },
  redirects: async () => {
    return [
      {
        source: '/meal-rating',
        destination: 'https://meal-rating.pito.vn',
        permanent: true,
      },
      {
        source: '/meal-rating/',
        destination: 'https://meal-rating.pito.vn',
        permanent: true,
      },
    ];
  },
};

module.exports = withSentryConfig(withEnvsAssurance(nextConfig), {
  org: 'pito-w7',
  project: 'pito-cloud-canteen',

  // An auth token is required for uploading source maps.
  authToken: process.env.SENTRY_AUTH_TOKEN,
  debug: false,
  sourcemaps: {
    disable: process.env.SENTRY_SOURCE_MAPS_ENABLED !== 'true',
  },
  telemetry: false,

  silent: false, // Can be used to suppress logs
});
