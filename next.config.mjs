/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async redirects() {
    return [
      { source: '/systems', destination: '/#product', permanent: false },
      { source: '/systems/malosound', destination: '/#product', permanent: false },
      { source: '/systems/rally', destination: '/#product', permanent: false },
      { source: '/rally', destination: '/#product', permanent: false },
      {
        source: '/green-machine',
        destination: '/systems/xiv',
        permanent: true,
      },
      {
        source: '/fsu-options-research',
        destination: '/systems/xiv',
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        ],
      },
    ];
  },
};

export default nextConfig;
