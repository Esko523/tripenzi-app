"use client";
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

// ZDE VLOŽ SVŮJ PUBLIC KEY Z GENERÁTORU
const PUBLIC_VAPID_KEY = "BK3gdl3LcTepKi_qBL8WE5ONcAwHqvEjlsTEal5iaj97YGwHozCBrHxq-T0P-wcaS063jQdw9sW0u88KeuguKw0"; 

export default function NotificationButton({ userId }: { userId: string }) {
  const [status, setStatus] = useState<'default' | 'loading' | 'subscribed'>('default');

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    return new Uint8Array([...rawData].map((char) => char.charCodeAt(0)));
  };

  const subscribeToPush = async () => {
    if (!('serviceWorker' in navigator)) return;
    setStatus('loading');

    try {
      const registration = await navigator.serviceWorker.ready;
      
      // 1. Získáme subscription od prohlížeče
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY),
      });

      // 2. Uložíme to do Supabase
      const { error } = await supabase.from('push_subscriptions').insert({
        user_id: userId,
        subscription: sub
      });

      if (error) throw error;
      
      setStatus('subscribed');
      alert("Notifikace zapnuty! 🔔");
      
    } catch (err) {
      console.error(err);
      alert("Nepodařilo se zapnout notifikace.");
      setStatus('default');
    }
  };

  if (status === 'subscribed') return <button disabled className="text-green-600 text-xs font-bold">🔔 Aktivní</button>;

  return (
    <button 
      onClick={subscribeToPush}
      className="bg-indigo-600 text-white px-3 py-2 rounded-xl text-xs font-bold shadow-md active:scale-95 transition"
    >
      {status === 'loading' ? 'Zapínám...' : '🔔 Zapnout notifikace'}
    </button>
  );
}