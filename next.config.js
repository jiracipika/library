/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@library/core', '@library/ui'],
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
};
module.exports = nextConfig;
