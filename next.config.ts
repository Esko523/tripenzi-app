import type { NextConfig } from "next";

// Import výchozích pravidel (obrázky, fonty...)
const defaultRuntimeCaching = require("next-pwa/cache");

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  
  runtimeCaching: [
    // 1. PRAVIDLO: Všechny stránky tripů (/trip/...)
    {
      urlPattern: ({ url }: { url: URL }) => {
        return url.pathname.startsWith('/trip/');
      },
      handler: 'NetworkFirst', // Zkus internet. Pokud nejde (nebo timeout), hned dej Cache.
      options: {
        cacheName: 'trip-pages-html',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 dní
        },
        networkTimeoutSeconds: 2, // Čekej na internet jen 2 sekundy, pak to vzdej a dej offline verzi
      },
    },
    // 2. Ostatní pravidla
    ...defaultRuntimeCaching,
  ],
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
};

export default withPWA(nextConfig);