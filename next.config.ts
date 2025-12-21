import type { NextConfig } from "next";

// Importujeme defaultní cacheovací strategie
const runtimeCaching = require("next-pwa/cache");

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  
  // TOTO JE TO NOVÉ A DŮLEŽITÉ:
  runtimeCaching: [
    ...runtimeCaching,
    // Přidáme pravidlo specificky pro naše dynamické stránky (tripy)
    {
      urlPattern: /\/trip\/.*/i, // Všechny adresy začínající /trip/
      handler: 'NetworkFirst', // Zkus internet, když nejde, dej cache
      options: {
        cacheName: 'trip-pages',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 dní
        },
        networkTimeoutSeconds: 3, // Po 3 sekundách to vzdej a ukaž cache
      },
    }
  ],
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
};

export default withPWA(nextConfig);