/// <reference lib="webworker" />

// 1. Zamezíme konfliktům s "self" tím, že si vytvoříme typovanou proměnnou
const sw = self as unknown as ServiceWorkerGlobalScope;

// 2. Naslouchání na příchozí notifikaci (PUSH)
sw.addEventListener('push', (event: any) => {
  // Používáme "event: any", abychom se vyhnuli chybám typů PushEvent, pokud nejsou v konfigu
  console.log('📩 [Service Worker] Push přijat!');

  let data;
  try {
    data = event.data?.json();
    console.log('📦 [Service Worker] Data:', data);
  } catch (e) {
    console.log('⚠️ [Service Worker] Neplatný JSON, používám fallback.');
    data = { title: 'Tripenzi', body: event.data?.text() || 'Nová zpráva' };
  }

  if (!data) data = { title: 'Tripenzi', body: 'Něco se děje!' };

  const promiseChain = sw.registration.showNotification(data.title, {
    body: data.body,
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    // @ts-ignore
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