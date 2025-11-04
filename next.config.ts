import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true,
  },
  distDir: process.env.NODE_ENV === "development" ? ".next-dev" : ".next",

  images: {
    remotePatterns: [
      {
        hostname: "**",
      },
    ],
  },

  env: {
    APP_VERSION: process.env.APP_VERSION || '1.0.0',
    BUILD_TIME: new Date().toISOString(),
  },
};

export default nextConfig;
