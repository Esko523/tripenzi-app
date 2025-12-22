import { NextResponse } from 'next/server';
import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

// Inicializace web-push
webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || 'mailto:test@test.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

// Inicializace Supabase (pro server)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, message, userIdToExclude } = body; // userIdToExclude = abychom neposílali notifikaci sami sobě

    // 1. Načteme všechny odběratele (kromě toho, kdo akci vyvolal)
    const { data: subscriptions } = await supabase
      .from('push_subscriptions')
      .select('subscription, user_id')
      .neq('user_id', userIdToExclude || ''); // Nechceme notifikovat sami sebe

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ message: 'Nikdo k obeslání.' });
    }

    // 2. Rozešleme notifikace
    const notifications = subscriptions.map((sub) => {
      // sub.subscription je JSON uložený v DB, musíme ho parsovat, pokud je to string, nebo použít přímo
      const pushSubscription = typeof sub.subscription === 'string' 
        ? JSON.parse(sub.subscription) 
        : sub.subscription;

      const payload = JSON.stringify({
        title: title || 'Tripenzi',
        body: message || 'Nová událost!',
        icon: '/icon-192x192.png' // Cesta k ikoně v public složce
      });

      return webpush.sendNotification(pushSubscription, payload).catch((err: any) => {
        if (err.statusCode === 410) {
          // Pokud už subscription neexistuje (uživatel to zrušil), měli bychom ji smazat z DB
          console.log(`Mazání neplatné subskripce pro user: ${sub.user_id}`);
          // Tady by mohl být delete call do Supabase
        }
        console.error('Chyba při odesílání:', err);
      });
    });

    await Promise.all(notifications);

    return NextResponse.json({ success: true, sentTo: subscriptions.length });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}