import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compiler: {
    styledComponents: true,
  },
  webpack(config) {
    return config;
  },
  sassOptions: {
    includePaths: [
      "./src",
      "./src/components"
    ],
  },
};

export default nextConfig;
