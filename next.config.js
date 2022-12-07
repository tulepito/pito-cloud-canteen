/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  trailingSlash: true,
  pageExtensions: ['page.tsx', 'page.jsx', 'api.ts', 'api.js'],
};

module.exports = nextConfig;
