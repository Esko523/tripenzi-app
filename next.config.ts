import type { NextConfig } from "next";

const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  cacheOnFrontEndNav: true, // Agresivní cachování při navigaci
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true, // Obnovit stránku po připojení (pro sync)
  swcMinify: true,
  disable: process.env.NODE_ENV === "development",
  
  // Důležité: Tady definujeme cachovací strategii
  workboxOptions: {
    disableDevLogs: true,
    runtimeCaching: [
      // 1. HLAVNÍ STRÁNKA (Start URL)
      {
        urlPattern: ({ url }: { url: URL }) => url.pathname === '/',
        handler: 'NetworkFirst',
        options: {
          cacheName: 'start-url',
          expiration: { maxEntries: 1, maxAgeSeconds: 24 * 60 * 60 },
        },
      },
      // 2. TRIPY (Agresivní cachování detailů)
      {
        urlPattern: ({ url }: { url: URL }) => url.pathname.includes('/trip/'),
        handler: 'NetworkFirst',
        options: {
          cacheName: 'pages-trips-v2', // Nová verze cache
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 dní
          },
          cacheableResponse: {
            statuses: [0, 200],
          },
        },
      },
      // 3. Statické soubory
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
      // 4. Supabase API
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