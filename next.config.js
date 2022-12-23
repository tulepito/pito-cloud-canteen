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
  pageExtensions: ['route.tsx', 'route.jsx', 'api.ts', 'api.js'],
  images: {
    domains: ['sharetribe.imgix.net'],
  },
};

module.exports = nextConfig;
