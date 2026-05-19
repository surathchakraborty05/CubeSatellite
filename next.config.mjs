/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },

  images: {
    unoptimized: true,
  },

  turbopack: {},

  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [
        ...(config.externals || []),
        "@luma.gl/core",
        "@luma.gl/webgl",
        "deck.gl",
        "@deck.gl/core",
        "@deck.gl/react",
        "@deck.gl/aggregation-layers",
      ];
    }

    return config;
  },
};

export default nextConfig;