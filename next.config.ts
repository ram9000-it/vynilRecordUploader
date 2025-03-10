/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  webpack: (config: any) => {
    config.watchOptions = {
      poll: 1000, // Verificar alterações a cada segundo
      aggregateTimeout: 300, // Atrasar a reconstrução por 300ms
    };
    return config;
  },
};

export default nextConfig;
