import type { NextConfig } from "next";

// next-intl is configured in Phase 6 with [locale] directory structure.
const nextConfig: NextConfig = {
  turbopack: {},
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost" },
    ],
  },
};

export default nextConfig;
