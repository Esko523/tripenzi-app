import type { NextConfig } from "next";

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  
  runtimeCaching: [
    // 1. HLAVNÍ PRAVIDLO PRO TRIPY
    {
      urlPattern: ({ url }: { url: URL }) => {
        // Bere vše, co má v URL 'trip'
        return url.pathname.includes('/trip/');
      },
      handler: 'NetworkFirst', // Zkus internet, když nejde, dej cache
      options: {
        cacheName: 'pages-trips', // Jednoduchý název
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 dní
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
    // 2. Všechno ostatní od Next.js (JS, CSS, JSON data)
    {
      urlPattern: ({ url }: { url: URL }) => {
        return url.pathname.startsWith('/_next/') || url.pathname.startsWith('/static/');
      },
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-assets',
        expiration: { maxEntries: 200, maxAgeSeconds: 24 * 60 * 60 * 30 },
      },
    },
    // 3. API
    {
        urlPattern: /^https:\/\/.*supabase\.co\/.*/i,
        handler: 'NetworkFirst',
        options: {
            cacheName: 'supabase-api',
            networkTimeoutSeconds: 5,
             expiration: { maxEntries: 100, maxAgeSeconds: 24 * 60 * 60 },
        }
    }
  ],
});

const nextConfig: NextConfig = {
  reactCompiler: true,
};

export default withPWA(nextConfig);