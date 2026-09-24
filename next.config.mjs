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
      {
        source: '/ai-blog/embracing-uncertainty',
        destination: '/ai-blog/all-in-every-time',
        permanent: true,
      },
      {
        source: '/field-notes/embracing-uncertainty',
        destination: '/ai-blog/all-in-every-time',
        permanent: true,
      },
      { source: '/systems', destination: '/#work', permanent: false },
      { source: '/systems/malosound', destination: '/#work', permanent: false },
      { source: '/systems/rally', destination: '/#work', permanent: false },
      { source: '/rally', destination: '/#work', permanent: false },
      { source: '/play', destination: '/#work', permanent: false },
      { source: '/play/:path*', destination: '/#work', permanent: false },
      { source: '/es/play', destination: '/es#work', permanent: false },
      { source: '/es/play/:path*', destination: '/es#work', permanent: false },
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
      {
        source: '/desk/:path*',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' },
          { key: 'Cache-Control', value: 'private, no-store, max-age=0' },
          { key: 'Referrer-Policy', value: 'no-referrer' },
        ],
      },
      {
        source: '/desk-assets/:path*',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' },
          { key: 'Referrer-Policy', value: 'no-referrer' },
          {
            key: 'Content-Security-Policy',
            value:
              "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'self'; form-action 'self'",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
