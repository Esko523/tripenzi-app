"use client";

import React, { useState, useEffect, useCallback, use } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import BudgetView from '@/components/BudgetView';
import SettingsView from '@/components/SettingsView';
import PlanView from '@/components/PlanView';
import InfoView from '@/components/InfoView';
import WeatherWidget from '@/components/WeatherWidget';
import { supabase } from '@/lib/supabaseClient';

// --- HLAVNÍ IKONY ---
const ArrowLeft = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>;
const ClockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const ListIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>;
const WalletIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>;
const InfoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="16" y2="12"/><line x1="12" x2="12.01" y1="8" y2="8"/></svg>;
const SettingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>;
const WifiOffIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="2" x2="22" y1="2" y2="22"/><path d="M12 20h.01"/><path d="M8.5 16.429a5 5 0 0 1 7 0"/><path d="M5 12.859a10 10 0 0 1 5.17-2.69"/><path d="M19 12.859a10 10 0 0 0-2.007-1.523"/><path d="M2 8.82a15 15 0 0 1 4.17-2.69"/><path d="M22 8.82a15 15 0 0 0-11.288-3.136"/><path d="M16.72 11.06a10 10 0 0 1 5.17 2.69"/></svg>;
const CloudUploadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M12 12v9"/><path d="m16 16-4-4-4 4"/></svg>;

type Event = { id: number; time: string; title: string; location?: string; date?: string; color?: string; };
type Participant = { id: number; name: string; };
type SplitMethod = 'equal' | 'exact' | 'shares';
type Expense = { 
  id: number; title: string; amount: number; currency: string; exchangeRate: number; payer: string; 
  category?: string; splitMethod?: SplitMethod; splitDetails?: Record<string, number>; forWhom?: string[]; isSettlement?: boolean;
};

type Trip = { 
  id: number; name: string; 
  startDate?: string; endDate?: string;
  dateFormatted?: string;
  color: string; 
  events?: Event[]; expenses?: Expense[]; participants?: Participant[];
  budget: number; spent: number;
  notes?: string; photoLink?: string; coverImage?: string;
  baseCurrency?: string;
  totalBudget?: number;
  shareCode?: string;
  mapLink?: string;
  weatherLocation?: string;
};

// --- TYPY PRO OFFLINE SYNC ---
type SyncAction = 
  | { type: 'ADD_EXPENSE'; payload: any; tempId: number }
  | { type: 'DELETE_EXPENSE'; payload: { id: number } }
  | { type: 'ADD_EVENT'; payload: any; tempId: number }
  | { type: 'DELETE_EVENT'; payload: { id: number } }
  | { type: 'UPDATE_EVENT'; payload: any; id: number }
  | { type: 'ADD_PARTICIPANT'; payload: { name: string }; tempId: number }
  | { type: 'DELETE_PARTICIPANT'; payload: { id: number } }
  | { type: 'UPDATE_DETAILS'; payload: { notes: string; photo_link: string } };

export default function TripDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const shareCodeParam = resolvedParams.id; 
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [activeTab, setActiveTab] = useState<'plan' | 'budget' | 'info' | 'settings'>('plan');
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [pendingSyncs, setPendingSyncs] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
      const tabParam = searchParams.get('tab');
      if (tabParam === 'settings') setActiveTab('settings');
  }, [searchParams]);

  // --- SYNC ENGINE ---
  const saveToQueue = (action: SyncAction) => {
      const queue: SyncAction[] = JSON.parse(localStorage.getItem(`sync_queue_${trip?.id}`) || '[]');
      queue.push(action);
      localStorage.setItem(`sync_queue_${trip?.id}`, JSON.stringify(queue));
      setPendingSyncs(queue.length);
  };

  const processQueue = useCallback(async () => {
    if (!trip?.id || !navigator.onLine || isSyncing) return;
    
    const queueKey = `sync_queue_${trip.id}`;
    const queue: SyncAction[] = JSON.parse(localStorage.getItem(queueKey) || '[]');
    
    if (queue.length === 0) {
        setPendingSyncs(0);
        return;
    }

    setIsSyncing(true);
    console.log("🔄 Spouštím synchronizaci...");

    const newQueue = [...queue];
    const processedIndices: number[] = [];

    for (let i = 0; i < queue.length; i++) {
        const action = queue[i];
        try {
            if (action.type === 'ADD_EXPENSE') {
                // Odstraníme tempId z payloadu pro DB
                await supabase.from('expenses').insert([{ ...action.payload, trip_id: trip.id }]);
            } 
            else if (action.type === 'DELETE_EXPENSE') {
                await supabase.from('expenses').delete().eq('id', action.payload.id);
            }
            else if (action.type === 'ADD_EVENT') {
                 await supabase.from('events').insert([{ ...action.payload, trip_id: trip.id }]);
            }
            else if (action.type === 'DELETE_EVENT') {
                await supabase.from('events').delete().eq('id', action.payload.id);
            }
            else if (action.type === 'UPDATE_EVENT') {
                await supabase.from('events').update(action.payload).eq('id', action.id);
            }
            else if (action.type === 'ADD_PARTICIPANT') {
                await supabase.from('participants').insert([{ trip_id: trip.id, name: action.payload.name }]);
            }
            else if (action.type === 'DELETE_PARTICIPANT') {
                await supabase.from('participants').delete().eq('id', action.payload.id);
            }
            else if (action.type === 'UPDATE_DETAILS') {
                 // Check if exists
                 const { data } = await supabase.from('trip_details').select('id').eq('trip_id', trip.id).maybeSingle();
                 if (data) await supabase.from('trip_details').update(action.payload).eq('trip_id', trip.id);
                 else await supabase.from('trip_details').insert([{ trip_id: trip.id, ...action.payload }]);
            }

            processedIndices.push(i);
        } catch (err) {
            console.error("Chyba při syncu akce:", action, err);
            // Pokud selže, necháme ji ve frontě (nebo ji přesuneme na konec)
        }
    }

    // Odstraníme zpracované akce
    const remainingQueue = newQueue.filter((_, index) => !processedIndices.includes(index));
    localStorage.setItem(queueKey, JSON.stringify(remainingQueue));
    setPendingSyncs(remainingQueue.length);
    setIsSyncing(false);

    // Načteme čerstvá data ze serveru (aby se srovnala IDčka)
    if (processedIndices.length > 0) {
        fetchTripData(true); 
    }
  }, [trip?.id, isSyncing]);

  // --- ONLINE/OFFLINE DETEKCE ---
  useEffect(() => {
    if (typeof navigator !== 'undefined') setIsOnline(navigator.onLine);
    
    // Při startu zkontrolujeme frontu
    if (trip?.id) {
        const q = JSON.parse(localStorage.getItem(`sync_queue_${trip.id}`) || '[]');
        setPendingSyncs(q.length);
    }

    const handleOnline = () => { 
        setIsOnline(true); 
        processQueue(); // Hned zkusit syncnout
        fetchTripData(true); 
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
    };
  }, [trip?.id, processQueue]);


  const formatDateRange = (start?: string, end?: string, textDate?: string) => {
      if (start) {
          const s = new Date(start).toLocaleDateString('cs-CZ', {day: 'numeric', month: 'numeric'});
          if (end) {
              const e = new Date(end).toLocaleDateString('cs-CZ', {day: 'numeric', month: 'numeric', year: 'numeric'});
              return `${s} – ${e}`;
          }
          return new Date(start).toLocaleDateString('cs-CZ', {day: 'numeric', month: 'numeric', year: 'numeric'});
      }
      return textDate || "Bez data";
  };

  const getCountdownText = () => {
      if (!trip?.startDate) return null;
      const now = new Date();
      const start = new Date(trip.startDate);
      const end = trip.endDate ? new Date(trip.endDate) : new Date(start);
      end.setHours(23, 59, 59);
      start.setHours(0, 0, 0);

      const diffStart = start.getTime() - now.getTime();
      
      if (diffStart > 0) {
          const days = Math.floor(diffStart / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diffStart % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          if (days > 0) return `⏳ Už jen ${days} dní a ${hours} hod!`;
          return `⏳ Už jen ${hours} hodin do startu!`;
      }
      if (now <= end) {
         const totalDuration = end.getTime() - start.getTime();
         const totalDays = Math.ceil(totalDuration / (1000 * 60 * 60 * 24)) || 1;
         const elapsed = now.getTime() - start.getTime();
         const currentDay = Math.floor(elapsed / (1000 * 60 * 60 * 24)) + 1;
         return `🚀 Den ${currentDay} z ${totalDays}`;
      }
      return "🏁 Trip skončil";
  };

  // --- FETCH DATA ---
  const fetchTripData = useCallback(async (forceOnline = false) => {
    const cacheKey = `trip_detail_${shareCodeParam}`;

    // 1. Zkusit cache (okamžité zobrazení)
    if (!forceOnline) {
        try {
            const cached = localStorage.getItem(cacheKey);
            if (cached) {
                setTrip(JSON.parse(cached));
                setLoading(false);
                // Kontrola fronty pro tento trip
                const parsed = JSON.parse(cached);
                const q = JSON.parse(localStorage.getItem(`sync_queue_${parsed.id}`) || '[]');
                setPendingSyncs(q.length);

                if (typeof navigator !== 'undefined' && !navigator.onLine) return;
            }
        } catch (e) { console.error(e); }
    }

    if (typeof navigator !== 'undefined' && !navigator.onLine) { setLoading(false); return; }

    try {
        const { data: tripData, error: tripError } = await supabase.from('trips').select('*').eq('share_code', shareCodeParam).single();
        if (tripError || !tripData) { 
            if (!isNaN(Number(shareCodeParam))) {
                 const { data: oldTrip } = await supabase.from('trips').select('*').eq('id', shareCodeParam).single();
                 if (oldTrip && oldTrip.share_code) { router.push(`/trip/${oldTrip.share_code}`); return; }
            }
            if (!localStorage.getItem(cacheKey)) router.push('/'); 
            return; 
        }

        const tripId = tripData.id;
        const { data: participantsData } = await supabase.from('participants').select('*').eq('trip_id', tripId);
        const { data: expensesData } = await supabase.from('expenses').select('*').eq('trip_id', tripId);
        const { data: detailsData } = await supabase.from('trip_details').select('*').eq('trip_id', tripId).maybeSingle();
        const { data: eventsData } = await supabase.from('events').select('*').eq('trip_id', tripId).order('date', { ascending: true }).order('time', { ascending: true });

        const loadedExpenses: Expense[] = (expensesData || []).map((e: any) => ({
            id: e.id, title: e.title, amount: e.amount, currency: e.currency, exchangeRate: e.exchange_rate, payer: e.payer, category: e.category, splitMethod: e.split_method, splitDetails: e.split_details, forWhom: e.for_whom, isSettlement: e.is_settlement
        }));

        const totalSpent = loadedExpenses.reduce((sum, item) => {
            if (item.isSettlement) return sum;
            return sum + (item.amount * (item.exchangeRate || 1));
        }, 0);

        const newTripObj: Trip = {
            id: tripData.id,
            name: tripData.name,
            startDate: tripData.start_date,
            endDate: tripData.end_date,
            dateFormatted: formatDateRange(tripData.start_date, tripData.end_date, tripData.date),
            color: tripData.color,
            baseCurrency: tripData.base_currency,
            totalBudget: tripData.total_budget,
            shareCode: tripData.share_code,
            mapLink: tripData.map_link,
            weatherLocation: tripData.weather_location, 
            budget: 0,
            spent: Math.round(totalSpent),
            coverImage: tripData.cover_image,
            notes: detailsData?.notes || "",
            photoLink: detailsData?.photo_link || "",
            events: eventsData || [], 
            participants: participantsData || [],
            expenses: loadedExpenses
        };

        setTrip(newTripObj);
        localStorage.setItem(cacheKey, JSON.stringify(newTripObj));
        
        // Zkontrolovat frontu i po fetchi
        const q = JSON.parse(localStorage.getItem(`sync_queue_${tripId}`) || '[]');
        setPendingSyncs(q.length);

    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, [shareCodeParam, router]);

  useEffect(() => { fetchTripData(); }, [fetchTripData]);

  // Realtime updates
  useEffect(() => {
    if (!trip?.id || !isOnline) return;
    const channel = supabase
      .channel(`trip_updates_${trip.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses', filter: `trip_id=eq.${trip.id}` }, () => fetchTripData(true))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events', filter: `trip_id=eq.${trip.id}` }, () => fetchTripData(true))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'participants', filter: `trip_id=eq.${trip.id}` }, () => fetchTripData(true))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'trip_details', filter: `trip_id=eq.${trip.id}` }, () => fetchTripData(true))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'trips', filter: `id=eq.${trip.id}` }, () => fetchTripData(true))
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [trip?.id, fetchTripData, isOnline]);

  // --- MODIFIKAČNÍ FUNKCE (OFFLINE READY) ---

  const addParticipant = async (name: string) => { 
      if (!trip) return;
      
      if (isOnline) {
          await supabase.from('participants').insert([{ trip_id: trip.id, name }]); 
          fetchTripData(true);
      } else {
          // Optimistický update
          const tempId = -Date.now();
          const newPart = { id: tempId, name };
          setTrip(prev => prev ? { ...prev, participants: [...(prev.participants || []), newPart] } : null);
          saveToQueue({ type: 'ADD_PARTICIPANT', payload: { name }, tempId });
      }
  };

  const deleteParticipant = async (id: number) => { 
      if (!trip) return;
      
      if (id < 0) { // Smazání offline položky (ještě není v DB)
           setTrip(prev => prev ? { ...prev, participants: prev.participants?.filter(p => p.id !== id) } : null);
           // Odstranit z fronty by bylo složitější, necháme sync selhat nebo to ignorujeme
           return;
      }

      if (isOnline) {
          await supabase.from('participants').delete().eq('id', id); 
          fetchTripData(true);
      } else {
          setTrip(prev => prev ? { ...prev, participants: prev.participants?.filter(p => p.id !== id) } : null);
          saveToQueue({ type: 'DELETE_PARTICIPANT', payload: { id } });
      }
  };
  
  const addExpense = async (expenseData: Omit<Expense, "id">): Promise<void> => { 
      if (!trip) return;
      const dbPayload = { 
          title: expenseData.title, amount: expenseData.amount, currency: expenseData.currency, 
          exchange_rate: expenseData.exchangeRate, payer: expenseData.payer, category: expenseData.category, 
          split_method: expenseData.splitMethod, split_details: expenseData.splitDetails, for_whom: expenseData.forWhom, 
          is_settlement: expenseData.isSettlement 
      };

      if (isOnline) {
          await supabase.from('expenses').insert([{ ...dbPayload, trip_id: trip.id }]); 
          fetchTripData(true);
      } else {
          const tempId = -Date.now();
          const newExpense = { ...expenseData, id: tempId };
          setTrip(prev => {
              if(!prev) return null;
              const newExpenses = [newExpense, ...(prev.expenses || [])];
              const newSpent = prev.spent + (newExpense.isSettlement ? 0 : (newExpense.amount * newExpense.exchangeRate));
              return { ...prev, expenses: newExpenses, spent: Math.round(newSpent) };
          });
          saveToQueue({ type: 'ADD_EXPENSE', payload: dbPayload, tempId });
      }
  };

  const deleteExpense = async (id: number) => { 
      if (!trip) return;

      if (id < 0) {
           setTrip(prev => prev ? { ...prev, expenses: prev.expenses?.filter(e => e.id !== id) } : null);
           return;
      }

      if (isOnline) {
          await supabase.from('expenses').delete().eq('id', id); 
          fetchTripData(true);
      } else {
          setTrip(prev => prev ? { ...prev, expenses: prev.expenses?.filter(e => e.id !== id) } : null);
          saveToQueue({ type: 'DELETE_EXPENSE', payload: { id } });
      }
  };
  
  const saveDetails = async (notes: string, photoLink: string) => { 
      if(!trip) return;
      
      if (isOnline) {
          const { data } = await supabase.from('trip_details').select('id').eq('trip_id', trip.id).maybeSingle(); 
          if (data) await supabase.from('trip_details').update({ notes, photo_link: photoLink }).eq('trip_id', trip.id); 
          else await supabase.from('trip_details').insert([{ trip_id: trip.id, notes, photo_link: photoLink }]);
      } else {
          setTrip(prev => prev ? { ...prev, notes, photoLink } : null);
          saveToQueue({ type: 'UPDATE_DETAILS', payload: { notes, photo_link: photoLink } });
      }
  };
  
  const addEvent = async (event: { title: string, location: string, time: string, date: string, color: string }) => { 
      if (!trip) return;
      
      if (isOnline) {
          await supabase.from('events').insert([{ trip_id: trip.id, ...event }]); 
          fetchTripData(true);
      } else {
          const tempId = -Date.now();
          const newEvent = { ...event, id: tempId };
          setTrip(prev => prev ? { ...prev, events: [...(prev.events || []), newEvent] } : null);
          saveToQueue({ type: 'ADD_EVENT', payload: event, tempId });
      }
  };

  const deleteEvent = async (id: number) => { 
      if (!trip) return;
      if (id < 0) {
           setTrip(prev => prev ? { ...prev, events: prev.events?.filter(e => e.id !== id) } : null);
           return;
      }

      if (isOnline) {
          await supabase.from('events').delete().eq('id', id); 
          fetchTripData(true);
      } else {
           setTrip(prev => prev ? { ...prev, events: prev.events?.filter(e => e.id !== id) } : null);
           saveToQueue({ type: 'DELETE_EVENT', payload: { id } });
      }
  };

  const editEvent = async (id: number, updatedData: { title: string, location: string, time: string, date: string, color: string }) => { 
      if(!trip) return;

      if (id < 0) {
          setTrip(prev => prev ? { ...prev, events: prev.events?.map(e => e.id === id ? { ...e, ...updatedData } : e) } : null);
          return;
      }

      if (isOnline) {
          await supabase.from('events').update(updatedData).eq('id', id); 
          fetchTripData(true);
      } else {
          setTrip(prev => prev ? { ...prev, events: prev.events?.map(e => e.id === id ? { ...e, ...updatedData } : e) } : null);
          saveToQueue({ type: 'UPDATE_EVENT', payload: updatedData, id });
      }
  };

  // Settings (Zbytek necháme jen online, jsou to citlivé akce)
  const handleUpdateTripFromSettings = async (updatedData: any) => {
      if(!trip) return;
      if (!isOnline) { alert("Nastavení tripu lze měnit jen online."); return; }
      const { error } = await supabase.from('trips').update(updatedData).eq('id', trip.id);
      if (!error) { alert("Nastavení uloženo! ✅"); fetchTripData(true); } else { alert("Chyba: " + error.message); }
  };

  const handleDeleteTripFromSettings = async () => {
      if(!trip) return;
      if (!isOnline) { alert("Smazat trip lze jen online."); return; }
      if(confirm("Opravdu smazat celý trip? Tato akce je nevratná.")) {
          const { error } = await supabase.from('trips').delete().eq('id', trip.id);
          if(!error) router.push('/');
          else alert("Chyba při mazání: " + error.message);
      }
  };

  const handleColorChange = async (newColor: string) => {
      if(!trip) return;
      if (!isOnline) { 
           setTrip(prev => prev ? { ...prev, color: newColor, coverImage: undefined } : null);
           // Barvu neukládáme do fronty, není kritická
           return; 
      }
      setTrip(prev => prev ? { ...prev, color: newColor, coverImage: undefined } : null);
      await supabase.from('trips').update({ color: newColor, cover_image: null }).eq('id', trip.id);
      fetchTripData(true);
  };

  if (loading || !trip) return <div className="p-10 text-center flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div></div>;

  const headerStyle = trip.coverImage ? { backgroundImage: `url(${trip.coverImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {};
  const headerClass = trip.coverImage ? "relative text-white" : `bg-gradient-to-r ${trip.color} text-white relative`;

  const glassContainer = "bg-black/20 backdrop-blur-md px-4 py-2 rounded-xl text-xs font-bold border border-white/10 text-white flex items-center gap-2 shadow-sm";

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans max-w-md mx-auto relative">
      {/* --- BANNER --- */}
      <div className={`${headerClass} p-6 pb-20 transition-all duration-500`} style={headerStyle}>
        {trip.coverImage && <div className="absolute inset-0 bg-black/40"></div>}
        
        <div className="relative z-10">
            {/* Horní řádek: Zpět + Odpočet */}
            <div className="mb-6 flex justify-between items-start">
                <Link href="/" className="p-2.5 bg-black/20 border border-white/10 rounded-xl hover:bg-black/30 transition backdrop-blur-md flex items-center justify-center text-white"><ArrowLeft /></Link>
                
                {trip.startDate && (
                    <div className="px-3 py-1.5 bg-yellow-400 text-yellow-900 rounded-xl text-[10px] font-black uppercase tracking-wide shadow-lg border border-yellow-200 transform rotate-1">
                        {getCountdownText()}
                    </div>
                )}
            </div>
            
            {/* Název a Info */}
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <h1 className="text-4xl font-bold drop-shadow-lg leading-tight">{trip.name}</h1>
                    
                    {/* Offline / Sync Indikátory */}
                    {!isOnline && (
                        <div className="bg-orange-500/90 text-white p-2 rounded-full shadow-lg border border-white/20 animate-pulse" title="Jsi offline">
                            <WifiOffIcon />
                        </div>
                    )}
                    {pendingSyncs > 0 && (
                         <div className="bg-blue-500/90 text-white px-2 py-1 rounded-lg shadow-lg border border-white/20 flex items-center gap-1 text-xs font-bold animate-bounce" title="Čekající změny">
                            <CloudUploadIcon /> {pendingSyncs}
                        </div>
                    )}
                </div>
                
                <div className="flex flex-wrap items-center gap-2">
                    <div className={glassContainer}>
                        <ClockIcon /> {trip.dateFormatted}
                    </div>
                    {isOnline && <WeatherWidget city={trip.weatherLocation || trip.name} />}
                </div>

                <div className="mt-2 inline-flex">
                    <div className={glassContainer}>
                        <span>💰 Útrata: {trip.spent} {trip.baseCurrency}</span>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* --- HLAVNÍ OBSAH --- */}
      <div className="-mt-12 bg-white rounded-t-3xl min-h-screen relative z-10 flex flex-col shadow-2xl shadow-black/5">
        
        {/* NAVIGACE */}
        <div className="flex border-b border-gray-100 px-2 pt-2">
          <button 
            onClick={() => setActiveTab('plan')} 
            className={`flex-1 py-4 text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${activeTab === 'plan' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <ListIcon /> PLÁN
          </button>
          
          <button 
            onClick={() => setActiveTab('budget')} 
            className={`flex-1 py-4 text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${activeTab === 'budget' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <WalletIcon /> ROZPOČET
          </button>
          
          <button 
            onClick={() => setActiveTab('info')} 
            className={`flex-1 py-4 text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${activeTab === 'info' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <InfoIcon /> INFO
          </button>
          
          <button 
            onClick={() => setActiveTab('settings')} 
            className={`flex-1 py-4 text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${activeTab === 'settings' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <SettingsIcon /> NASTAVENÍ
          </button>
        </div>

        <div className="p-6 flex-1">
          {activeTab === 'plan' && (
            <PlanView 
                events={trip.events || []}
                trip={trip}
                onAddEvent={addEvent}
                onDeleteEvent={deleteEvent}
                onEditEvent={editEvent}
            />
          )}

          {activeTab === 'budget' && (
            <BudgetView 
              expenses={trip.expenses || []}
              participants={trip.participants || []}
              baseCurrency={trip.baseCurrency || "CZK"}
              totalBudget={trip.totalBudget || 0}
              onAddExpense={addExpense}
              onDeleteExpense={deleteExpense}
            />
          )}

          {activeTab === 'info' && (
            <InfoView 
                trip={trip}
                participants={trip.participants || []}
                onAddParticipant={addParticipant}
                onDeleteParticipant={deleteParticipant}
                onSaveDetails={saveDetails}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView 
                trip={trip}
                onUpdate={handleUpdateTripFromSettings}
                onDelete={handleDeleteTripFromSettings}
                onColorChange={handleColorChange}
            />
          )}
        </div>
      </div>
    </div>
  );
}