import type { NextConfig } from "next";

// Načteme defaultní pravidla
const defaultRuntimeCaching = require("next-pwa/cache");

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  
  // Důležité: Tímto řekneme, že PWA platí pro celý web
  scope: '/',
  
  runtimeCaching: [
    // 1. PRAVIDLO: VŠECHNY STRÁNKY TRIPŮ (HTML)
    // Toto je to nejdůležitější pravidlo. Říká:
    // "Když uživatel jde na adresu, která začíná /trip/, ulož to!"
    {
      urlPattern: ({ url }: { url: URL }) => {
        return url.pathname.startsWith('/trip/');
      },
      // Strategie: NetworkFirst = Zkus internet. Když nejde, dej Cache.
      // To je lepší než StaleWhileRevalidate pro dynamické stránky, které se mění.
      handler: 'NetworkFirst', 
      options: {
        cacheName: 'trip-pages-html',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 dní
        },
        // Pokud internet neodpoví do 2 sekund, použij offline verzi
        networkTimeoutSeconds: 2, 
      },
    },
    
    // 2. OSTATNÍ (Obrázky, styly, skripty...)
    ...defaultRuntimeCaching,
  ],
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
};

export default withPWA(nextConfig);