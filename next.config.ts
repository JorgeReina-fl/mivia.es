import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  serverExternalPackages: ['@prisma/client', '.prisma/client', 'pdf2json', 'mammoth'],
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [
        ...(Array.isArray(config.externals) ? config.externals : [config.externals].filter(Boolean)),
        '@prisma/client',
        '.prisma/client',
        'pdf2json',
        'mammoth',
      ]
    }
    return config
  },
};

export default nextConfig;
