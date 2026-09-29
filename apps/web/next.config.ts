import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // compile shared's raw TS as part of the Next build
  transpilePackages: ['@xperience/shared'],
};

export default nextConfig;
