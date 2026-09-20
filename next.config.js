/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: false },
  compress: true,
  experimental: {
    staleTimes: { dynamic: 60, static: 300 },
  },
};

module.exports = nextConfig;
