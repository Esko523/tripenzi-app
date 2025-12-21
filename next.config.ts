import type { NextConfig } from "next";

// Importujeme defaultní pravidla pro cache (obrázky, fonty, atd.)
const runtimeCaching = require("next-pwa/cache");

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  
  // TOTO JE TO NOVÉ A DŮLEŽITÉ:
  runtimeCaching: [
    ...runtimeCaching, // Převezmeme standardní pravidla
    {
      // Pravidlo pro detaily tripů (adresy obsahující /trip/)
      urlPattern: /\/trip\/.*/i, 
      handler: 'NetworkFirst', // Zkus internet. Když nejde, použij Cache.
      options: {
        cacheName: 'trip-pages',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24 * 30, // Pamatuj si to 30 dní
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