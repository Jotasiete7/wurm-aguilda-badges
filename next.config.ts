import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  transpilePackages: ["@ecossistema-guilda"],
  experimental: {
    externalDir: true,
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@ecossistema-guilda': path.resolve(__dirname, './src/ecossistema-guilda'),
      'lucide-react': path.resolve(__dirname, 'node_modules/lucide-react'),
    };
    return config;
  },
};

export default nextConfig;
