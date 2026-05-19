import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.siliconflow.cn' },
      { protocol: 'https', hostname: 's3.siliconflow.cn' },
    ],
  },
};

export default nextConfig;
