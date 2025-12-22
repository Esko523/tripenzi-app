"use client";

import { useEffect, useState } from "react";

export default function CacheLogger() {
  const [logs, setLogs] = useState<string[]>([]);

  // Pomocná funkce pro logování na obrazovku i do konzole
  const log = (msg: string) => {
    console.log(`[PWA] ${msg}`);
    setLogs(prev => [...prev, msg]);
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const runDiagnostics = async () => {
      log("🚀 Spouštím diagnostiku...");

      // 1. KONTROLA SERVICE WORKERA
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.getRegistration();
        const controller = navigator.serviceWorker.controller;
        
        log(`Service Worker registrace: ${reg ? "✅ Nalezena" : "❌ Nenalezena"}`);
        log(`Service Worker ovládá stránku: ${controller ? "✅ ANO" : "❌ NE (Možná jsi v Dev módu?)"}`);
        
        if (!controller) {
             log("⚠️ Pokud toto vidíš, PWA nefunguje. Zkus 'npm run build' a 'npm run start'.");
             return; // Nemá smysl pokračovat
        }
      } else {
        log("❌ Prohlížeč nepodporuje Service Worker.");
        return;
      }

      // 2. VÝPIS VŠECH CACHE ÚLOŽIŠŤ
      if ('caches' in window) {
        const keys = await caches.keys();
        log(`📂 Nalezeno celkem ${keys.length} úložišť v Cache.`);

        if (keys.length === 0) {
            log("⚠️ Žádná cache nenalezena. Navštívil jsi stránku online?");
        }

        // Projdeme každou cache a hledáme naši stránku
        let foundPage = false;
        const currentPath = window.location.pathname;

        for (const key of keys) {
            const cache = await caches.open(key);
            const requests = await cache.keys();
            log(`📦 Úložiště '${key}' obsahuje ${requests.length} souborů.`);
            
            // Hledáme aktuální stránku v této cache
            const match = requests.find(req => req.url.includes(currentPath));
            if (match) {
                log(`✅ ÚSPĚCH! Tato stránka (${currentPath}) je uložena v '${key}'.`);
                foundPage = true;
            }
        }

        if (!foundPage) {
            log(`❌ Tuto stránku (${currentPath}) jsem v žádné cache nenašel.`);
        }
      }
    };

    // Spustit s malým zpožděním
    setTimeout(runDiagnostics, 1000);
  }, []);

  // Vypíšeme logy přímo na obrazovku (dočasně), abys to viděl hned
  // Zobrazí se jen pokud jsi Offline nebo pro ladění
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/90 text-green-400 p-4 font-mono text-xs z-[9999] max-h-48 overflow-y-auto border-t-2 border-green-500 opacity-90 pointer-events-none">
      <strong>PWA DEBUG LOG:</strong>
      {logs.map((l, i) => <div key={i}>{l}</div>)}
    </div>
  );
}