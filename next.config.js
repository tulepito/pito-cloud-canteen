/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { dirs: ['.'] },
  reactStrictMode: true,
  swcMinify: true,
  trailingSlash: true,
  pageExtensions: ['page.tsx', 'page.jsx', 'api.ts', 'api.js'],
};

module.exports = nextConfig;
