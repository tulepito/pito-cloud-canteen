/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { dirs: ['.'] },
  reactStrictMode: true,
  swcMinify: true,
  trailingSlash: true,
  i18n: {
    locales: ['vi', 'en'],
    defaultLocale: 'vi',
  },
  pageExtensions: ['page.tsx', 'page.jsx', 'api.ts', 'api.js'],
};

module.exports = nextConfig;
