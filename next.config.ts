import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  compiler: {
    styledComponents: true,
  },
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
