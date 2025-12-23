// @ts-nocheck
/// <reference lib="webworker" />

const sw = self as unknown as ServiceWorkerGlobalScope;

sw.addEventListener('install', () => {
  console.log('👷 [Service Worker] Instalace...');
  sw.skipWaiting(); // Nečekat ve frontě, hned aktivovat
});

sw.addEventListener('activate', (event) => {
  console.log('🚀 [Service Worker] Aktivace...');
  event.waitUntil(sw.clients.claim()); // Okamžitě převzít kontrolu nad otevřenými stránkami
});

// 2. Naslouchání na příchozí notifikaci (PUSH)
sw.addEventListener('push', (event: any) => {
  console.log('📩 [Service Worker] Push přijat!');

  let data;
  try {
    data = event.data?.json();
    console.log('📦 [Service Worker] Data:', data);
  } catch (e) {
    console.log('⚠️ [Service Worker] Neplatný JSON, používám fallback.');
    data = { title: 'Tripenzi', body: event.data?.text() || 'Nová zpráva' };
  }

  // Fallback, pokud data chybí úplně
  if (!data) data = { title: 'Tripenzi', body: 'Něco se děje!' };

  const promiseChain = sw.registration.showNotification(data.title, {
    body: data.body,
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    // @ts-ignore - TypeScript definice pro vibrate chybí, ale prohlížeče to umí
    vibrate: [100, 50, 100],
    data: {
      url: sw.location.origin + '/trip/' + (data.shareCode || ''),
    },
  });

  event.waitUntil(promiseChain);
});

// 3. Co se stane, když na notifikaci klikneš
sw.addEventListener('notificationclick', (event: any) => {
  console.log('👆 [Service Worker] Kliknuto na notifikaci');
  event.notification.close();

  event.waitUntil(
    sw.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Pokud je aplikace už otevřená, zaměřit ji
      if (clientList.length > 0) {
        let client = clientList[0];
        for (let i = 0; i < clientList.length; i++) {
          if (clientList[i].focused) {
            client = clientList[i];
          }
        }
        return client.focus();
      }
      // Jinak otevřít nové okno
      return sw.clients.openWindow(event.notification.data.url || '/');
    })
  );
});

// 4. PŘIDÁNO: Testování z hlavní konzole
sw.addEventListener('message', (event: any) => {
  if (event.data && event.data.type === 'TEST_PUSH') {
    const promiseChain = sw.registration.showNotification('Test z hlavní konzole', {
      body: 'Funguje to! Obešli jsme hledání Inspect tlačítka. 😎',
      icon: '/icon-192x192.png',
      vibrate: [100, 50, 100],
    });
    event.waitUntil(promiseChain);
  }
});