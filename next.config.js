/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  sassOptions: {
    includePaths: [
      "./src",
      "./src/components"
    ],
  },
  webpack: (config) => {
    // Configurações do webpack, se necessário
    return config;
  },
  // Desabilitar otimizações CSS em desenvolvimento para facilitar o debug
  experimental: {
    optimizeCss: false,
  },
};

module.exports = nextConfig;
