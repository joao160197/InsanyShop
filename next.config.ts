import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  webpack(config) {
    // Configurações do webpack
    return config;
  },
  // Habilita o suporte a módulos CSS
  sassOptions: {
    includePaths: [
      "./src",
      "./src/components"
    ],
  },
};

export default nextConfig;
