import type { NextConfig } from "next";

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // This will ignore ALL ESLint errors
  },
};

export default nextConfig;
