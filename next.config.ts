import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'assets-global.website-files.com' },
      { protocol: 'https', hostname: 'uploads-ssl.webflow.com' },
      { protocol: 'https', hostname: 'assets.website-files.com' },
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },
};

export default nextConfig;
