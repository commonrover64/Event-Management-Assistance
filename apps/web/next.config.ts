import type { NextConfig } from 'next';

// Server-side only: the browser never sees this URL, it only talks to /api on this origin
const API_URL = process.env.API_URL ?? 'http://localhost:4000';

const nextConfig: NextConfig = {
  // compile shared's raw TS as part of the Next build
  transpilePackages: ['@xperience/shared'],
  async rewrites() {
    return [{ source: '/api/:path*', destination: `${API_URL}/api/:path*` }];
  },
};

export default nextConfig;
