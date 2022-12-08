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
  pageExtensions: ['page.tsx', 'page.jsx', 'api.ts', 'api.js'],
};

module.exports = nextConfig;
