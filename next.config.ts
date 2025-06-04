/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  trailingSlash: true,
  reactStrictMode: true,
  // Adicionar configuração para o Amplify
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  },
  // Configuração para otimizar o build
  poweredByHeader: false,
  // Configuração para lidar com imagens externas
  images: {
    domains: ['localhost', 'api.obershop.com.br'],
    unoptimized: process.env.NODE_ENV !== 'production',
  },
};

module.exports = nextConfig;



