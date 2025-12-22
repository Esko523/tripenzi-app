import type { NextConfig } from "next";

// Načteme výchozí cachovací pravidla, abychom nerozbili zbytek aplikace
const defaultRuntimeCaching = require("next-pwa/cache");

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  
  // TADY JE TA MAGIE:
  runtimeCaching: [
    {
      // 1. Pravidlo pro detaily tripů (/trip/...)
      urlPattern: ({ url }: { url: URL }) => url.pathname.startsWith('/trip/'),
      
      // 'StaleWhileRevalidate' znamená:
      // "Když jsi offline, ukaž okamžitě to, co máš uložené v paměti (i kdyby to bylo staré).
      // Když jsi online, ukaž to taky hned, ale na pozadí si stáhni novou verzi pro příště."
      handler: 'StaleWhileRevalidate',
      
      options: {
        cacheName: 'trip-pages-cache', // Název úložiště
        expiration: {
          maxEntries: 50, // Pamatuj si maximálně 50 posledních tripů
          maxAgeSeconds: 30 * 24 * 60 * 60, // Pamatuj si je 30 dní
        },
      },
    },
    // 2. Přidáme zpět všechna ostatní výchozí pravidla (pro obrázky, styly, atd.)
    ...defaultRuntimeCaching,
  ],
});

const nextConfig: NextConfig = {
  reactCompiler: true,
};

export default withPWA(nextConfig);