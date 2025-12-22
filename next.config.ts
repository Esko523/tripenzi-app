import type { NextConfig } from "next";

// Import defaultních pravidel
const defaultRuntimeCaching = require("next-pwa/cache");

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  
  // TOTO JE TO, CO TI CHYBÍ:
  runtimeCaching: [
    // 1. Ukládání HTML stránek tripů
    {
      urlPattern: ({ url }: { url: URL }) => {
        return url.pathname.startsWith('/trip/');
      },
      handler: 'NetworkFirst', // Zkus internet, když nejde, dej cache
      options: {
        cacheName: 'trip-pages-html',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 dní
        },
        networkTimeoutSeconds: 2, // Čekej na net max 2 vteřiny
      },
    },
    // 2. Ostatní pravidla (obrázky, styly...)
    ...defaultRuntimeCaching,
  ],
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
};

export default withPWA(nextConfig);