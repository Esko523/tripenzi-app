import type { NextConfig } from "next";

const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  swcMinify: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    disableDevLogs: true,
    runtimeCaching: [
      {
        urlPattern: ({ url }: { url: URL }) => url.pathname === '/',
        handler: 'NetworkFirst',
        options: {
          cacheName: 'start-url',
          expiration: { maxEntries: 1, maxAgeSeconds: 24 * 60 * 60 },
        },
      },
      {
        urlPattern: ({ url }: { url: URL }) => url.pathname.includes('/trip/'),
        handler: 'NetworkFirst',
        options: {
          cacheName: 'pages-trips-v2',
          expiration: { maxEntries: 50, maxAgeSeconds: 30 * 24 * 60 * 60 },
          cacheableResponse: { statuses: [0, 200] },
        },
      },
      {
        urlPattern: ({ url }: { url: URL }) => 
          url.pathname.startsWith('/_next/') || 
          url.pathname.startsWith('/static/') ||
          /\.(js|css|png|jpg|jpeg|svg|ico)$/i.test(url.pathname),
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'static-assets-v2',
          expiration: { maxEntries: 200, maxAgeSeconds: 30 * 24 * 60 * 60 },
        },
      },
      {
        urlPattern: /^https:\/\/.*supabase\.co\/.*/i,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'supabase-api-v2',
          networkTimeoutSeconds: 5,
          expiration: { maxEntries: 100, maxAgeSeconds: 24 * 60 * 60 },
        },
      },
    ],
  },
});

const nextConfig: NextConfig = {
  reactCompiler: true,
};

export default withPWA(nextConfig);