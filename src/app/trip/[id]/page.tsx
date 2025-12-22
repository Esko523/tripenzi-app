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
const WifiIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h.01"/><path d="M2 8.82a15 15 0 0 1 20 0"/><path d="M5 12.859a10 10 0 0 1 14 0"/><path d="M8.5 16.429a5 5 0 0 1 7 0"/></svg>;
const WifiOffIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="2" x2="22" y1="2" y2="22"/><path d="M12 20h.01"/><path d="M8.5 16.429a5 5 0 0 1 7 0"/><path d="M5 12.859a10 10 0 0 1 5.17-2.69"/><path d="M19 12.859a10 10 0 0 0-2.007-1.523"/><path d="M2 8.82a15 15 0 0 1 4.17-2.69"/><path d="M22 8.82a15 15 0 0 0-11.288-3.136"/><path d="M16.72 11.06a10 10 0 0 1 5.17 2.69"/></svg>;

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

export default function TripDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const shareCodeParam = resolvedParams.id; 
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [activeTab, setActiveTab] = useState<'plan' | 'budget' | 'info' | 'settings'>('plan');
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true); // Nový stav

  useEffect(() => {
      const tabParam = searchParams.get('tab');
      if (tabParam === 'settings') setActiveTab('settings');
  }, [searchParams]);

  // --- ONLINE/OFFLINE DETEKCE ---
  useEffect(() => {
    if (typeof navigator !== 'undefined') setIsOnline(navigator.onLine);
    
    const handleOnline = () => { setIsOnline(true); fetchTripData(true); }; // Při připojení obnovit data
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
    };
  }, []);

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

  // --- LOCAL FIRST FETCH ---
  const fetchTripData = useCallback(async (forceOnline = false) => {
    const cacheKey = `trip_detail_${shareCodeParam}`;

    // 1. Zkusit načíst z cache (okamžitě)
    if (!forceOnline) {
        try {
            const cached = localStorage.getItem(cacheKey);
            if (cached) {
                const parsed = JSON.parse(cached);
                setTrip(parsed);
                setLoading(false);
                // Pokud jsme offline, končíme zde a používáme cache
                if (typeof navigator !== 'undefined' && !navigator.onLine) return;
            }
        } catch (e) { console.error("Cache read error", e); }
    }

    // 2. Pokud jsme offline a nemáme cache, máme smůlu (zobrazí loading nebo chybu)
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
        setLoading(false);
        return;
    }

    // 3. Online fetch (Sync)
    try {
        const { data: tripData, error: tripError } = await supabase.from('trips').select('*').eq('share_code', shareCodeParam).single();
        if (tripError || !tripData) { 
            // Fallback pro ID místo share_code
            if (!isNaN(Number(shareCodeParam))) {
                 const { data: oldTrip } = await supabase.from('trips').select('*').eq('id', shareCodeParam).single();
                 if (oldTrip && oldTrip.share_code) { router.push(`/trip/${oldTrip.share_code}`); return; }
            }
            // Pokud trip neexistuje a nemáme ho v cache -> domů
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
        
        // ULOŽIT DO CACHE
        localStorage.setItem(cacheKey, JSON.stringify(newTripObj));

    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, [shareCodeParam, router]);

  useEffect(() => { fetchTripData(); }, [fetchTripData]);

  // Realtime updates (jen když jsme online)
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

  // --- WRITE FUNCTIONS (BLOKOVÁNY OFFLINE) ---
  const checkOnline = () => {
    if (!navigator.onLine) {
        alert("Jsi offline 🌐\n\nZměny můžeš provádět, až se připojíš k internetu.");
        return false;
    }
    return true;
  };

  const addParticipant = async (name: string) => { if (!trip || !checkOnline()) return; await supabase.from('participants').insert([{ trip_id: trip.id, name }]); fetchTripData(true); };
  const deleteParticipant = async (id: number) => { if (!checkOnline()) return; await supabase.from('participants').delete().eq('id', id); fetchTripData(true); };
  
  const addExpense = async (expenseData: Omit<Expense, "id">): Promise<void> => { if (!trip || !checkOnline()) return; const dbPayload = { trip_id: trip.id, title: expenseData.title, amount: expenseData.amount, currency: expenseData.currency, exchange_rate: expenseData.exchangeRate, payer: expenseData.payer, category: expenseData.category, split_method: expenseData.splitMethod, split_details: expenseData.splitDetails, for_whom: expenseData.forWhom, is_settlement: expenseData.isSettlement }; await supabase.from('expenses').insert([dbPayload]); fetchTripData(true); };
  const deleteExpense = async (id: number) => { if (!checkOnline()) return; await supabase.from('expenses').delete().eq('id', id); fetchTripData(true); };
  
  const saveDetails = async (notes: string, photoLink: string) => { if(!trip || !checkOnline()) return; const { data } = await supabase.from('trip_details').select('id').eq('trip_id', trip.id).maybeSingle(); if (data) await supabase.from('trip_details').update({ notes, photo_link: photoLink }).eq('trip_id', trip.id); else await supabase.from('trip_details').insert([{ trip_id: trip.id, notes, photo_link: photoLink }]); };
  
  const addEvent = async (event: { title: string, location: string, time: string, date: string, color: string }) => { if (!trip || !checkOnline()) return; await supabase.from('events').insert([{ trip_id: trip.id, ...event }]); fetchTripData(true); };
  const deleteEvent = async (id: number) => { if (!checkOnline()) return; await supabase.from('events').delete().eq('id', id); fetchTripData(true); };
  const editEvent = async (id: number, updatedData: { title: string, location: string, time: string, date: string, color: string }) => { if (!checkOnline()) return; await supabase.from('events').update(updatedData).eq('id', id); fetchTripData(true); };

  const handleUpdateTripFromSettings = async (updatedData: any) => {
      if(!trip || !checkOnline()) return;
      const { error } = await supabase.from('trips').update(updatedData).eq('id', trip.id);
      if (!error) { alert("Nastavení uloženo! ✅"); fetchTripData(true); } else { alert("Chyba: " + error.message); }
  };

  const handleDeleteTripFromSettings = async () => {
      if(!trip || !checkOnline()) return;
      if(confirm("Opravdu smazat celý trip? Tato akce je nevratná.")) {
          const { error } = await supabase.from('trips').delete().eq('id', trip.id);
          if(!error) router.push('/');
          else alert("Chyba při mazání: " + error.message);
      }
  };

  const handleColorChange = async (newColor: string) => {
      if(!trip || !checkOnline()) return;
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
                    {/* Offline indikátor */}
                    {!isOnline && (
                        <div className="bg-orange-500/90 text-white p-2 rounded-full shadow-lg border border-white/20 animate-pulse" title="Jsi offline">
                            <WifiOffIcon />
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

      {/* --- HLAVNÍ OBSAH (Méně kulatý vršek: rounded-t-3xl) --- */}
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