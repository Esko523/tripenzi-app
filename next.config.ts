import type { NextConfig } from "next";

// Import výchozích pravidel
const defaultRuntimeCaching = require("next-pwa/cache");

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development', // PWA běží jen při 'npm run build' -> 'npm start'
  
  runtimeCaching: [
    // 1. NAŠE PRAVIDLO PRO TRIPY (Dáme ho na začátek jako prioritu!)
    {
      // Chytáme všechny adresy, co začínají /trip/
      urlPattern: ({ url }: { url: URL }) => url.pathname.startsWith('/trip/'),
      
      // Strategie: 'StaleWhileRevalidate' 
      // (Zobraz hned to, co máš uložené v paměti, a na pozadí se zkus aktualizovat)
      // To je pro offline režim nejrychlejší a nejspolehlivější.
      handler: 'StaleWhileRevalidate',
      
      options: {
        cacheName: 'trip-pages-html',
        expiration: {
          maxEntries: 100, // Ulož si posledních 100 navštívených tripů
          maxAgeSeconds: 60 * 60 * 24 * 365, // Pamatuj si je rok
        },
      },
    },
    // 2. OSTATNÍ PRAVIDLA (Obrázky, fonty, zbytek webu)
    ...defaultRuntimeCaching,
  ],
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
};

export default withPWA(nextConfig);