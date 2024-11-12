/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuração de headers CORS
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.NEXT_PUBLIC_API_URL || '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET,DELETE,PATCH,POST,PUT,OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization',
          },
        ],
      },
    ];
  },

  // Configuração de rewrites para proxy em desenvolvimento
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*`,
      },
    ];
  },

  // Outras configurações
  reactStrictMode: true,
  swcMinify: true,

  // Se você estiver tendo problemas com CORS especificamente na Vercel
  async redirects() {
    return [
      {
        source: '/api/:path*',
        has: [
          {
            type: 'header',
            key: 'x-skip-proxy',
            value: '1',
          },
        ],
        permanent: false,
        destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*`,
      },
    ];
  },
};

// Use module.exports ao invés de export default
module.exports = nextConfig;