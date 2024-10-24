/** @type {import('next').NextConfig} */
const { withEnvsAssurance } = require('./next.config.env.js');

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
    ];
  },
  pageExtensions: ['route.tsx', 'route.jsx', 'api.ts', 'api.js'],
  images: {
    domains: ['sharetribe.imgix.net', 'res.cloudinary.com'],
    unoptimized: true,
  },
};

module.exports = withEnvsAssurance(nextConfig);
