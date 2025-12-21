import type { NextConfig } from "next";

// Načtení PWA pluginu
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development', // Ve vývoji vypnuto, aby to neotravovalo
});

const nextConfig: NextConfig = {
  reactCompiler: true, // Tohle tam máš teď
};

// Obalení konfigurace
export default withPWA(nextConfig);