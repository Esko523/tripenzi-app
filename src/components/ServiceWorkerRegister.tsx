"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => console.log('✅ Service Worker registrován automaticky:', reg))
        .catch((err) => console.error('❌ Chyba registrace SW:', err));
    }
  }, []);

  return null; // Tato komponenta nic nevykresluje, jen spouští logiku
}