"use client";

import { useEffect } from "react";

export default function PwaRegister() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      // Zkusíme zaregistrovat sw.js ručně
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("✅ [Manual] Service Worker zaregistrován:", reg);
        })
        .catch((err) => {
          console.error("❌ [Manual] Registrace SW selhala:", err);
        });
    }
  }, []);

  return null;
}