"use client";

import React, { useState, useEffect, useCallback, use, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation'; // Přidáno useSearchParams
import BudgetView from '@/components/BudgetView';
import { supabase } from '@/lib/supabaseClient';

// --- IKONY (Zůstávají stejné) ---
const ArrowLeft = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>;
const ClockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const ListIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>;
const WalletIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>;
const InfoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="16" y2="12"/><line x1="12" x2="12.01" y1="8" y2="8"/></svg>;
const SettingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>;
const CheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>;
const Share2Icon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/></svg>;
const MapIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" x2="9" y1="3" y2="18"/><line x1="15" x2="15" y1="6" y2="21"/></svg>;
const PhotoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>;

type Event = { id: number; time: string; title: string; date?: string; color?: string; };
type Participant = { id: number; name: string; };
type SplitMethod = 'equal' | 'exact' | 'shares';
type Expense = { 
  id: number; title: string; amount: number; currency: string; exchangeRate: number; payer: string; 
  category?: string; splitMethod?: SplitMethod; splitDetails?: Record<string, number>; forWhom?: string[]; isSettlement?: boolean;
};

type Trip = { 
  id: number; name: string; date: string; color: string; 
  events?: Event[]; expenses?: Expense[]; participants?: Participant[];
  budget: number; spent: number;
  notes?: string; photoLink?: string; coverImage?: string;
  baseCurrency?: string;
  totalBudget?: number;
  shareCode?: string;
  mapLink?: string;
};

const GRADIENTS = [
  "from-blue-500 to-cyan-400", "from-purple-500 to-indigo-500", "from-green-400 to-emerald-500",
  "from-yellow-400 to-orange-500", "from-pink-500 to-rose-500", "from-gray-700 to-black",
];
const DOT_COLORS = ["bg-blue-500", "bg-red-500", "bg-green-500", "bg-yellow-500", "bg-purple-500", "bg-slate-500"];
const CURRENCIES = ["CZK", "EUR", "USD", "PLN", "HRK", "GBP", "VND", "IDR", "HUF", "THB"];

export default function TripDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const shareCodeParam = resolvedParams.id; 
  const router = useRouter();
  const searchParams = useSearchParams(); // Přidáno pro čtení ?tab=settings
  
  // Inicializace tabu podle URL
  const [activeTab, setActiveTab] = useState<'plan' | 'budget' | 'info' | 'settings'>('plan');
  
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);

  // Stavy formulářů
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventTime, setNewEventTime] = useState("");
  const [newEventDate, setNewEventDate] = useState("");
  const [newEventColor, setNewEventColor] = useState("bg-blue-500");
  
  const [notes, setNotes] = useState("");
  const [photoLink, setPhotoLink] = useState("");
  const [newParticipant, setNewParticipant] = useState("");
  
  const [editName, setEditName] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editImage, setEditImage] = useState("");
  const [editCurrency, setEditCurrency] = useState("CZK");
  const [editBudget, setEditBudget] = useState("");
  const [editMapLink, setEditMapLink] = useState("");

  // Efekt pro nastavení záložky po načtení
  useEffect(() => {
      const tabParam = searchParams.get('tab');
      if (tabParam === 'settings') setActiveTab('settings');
  }, [searchParams]);

  const fetchTripData = useCallback(async () => {
    try {
        const { data: tripData, error: tripError } = await supabase.from('trips').select('*').eq('share_code', shareCodeParam).single();
        
        if (tripError || !tripData) { 
            if (!isNaN(Number(shareCodeParam))) {
                 const { data: oldTrip } = await supabase.from('trips').select('*').eq('id', shareCodeParam).single();
                 if (oldTrip && oldTrip.share_code) {
                     router.push(`/trip/${oldTrip.share_code}`);
                     return; 
                 }
            }
            router.push('/'); 
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
            const rate = item.exchangeRate || 1;
            return sum + (item.amount * rate);
        }, 0);

        setTrip({
            id: tripData.id,
            name: tripData.name,
            date: tripData.date,
            color: tripData.color,
            baseCurrency: tripData.base_currency,
            totalBudget: tripData.total_budget,
            shareCode: tripData.share_code,
            mapLink: tripData.map_link,
            budget: 0,
            spent: Math.round(totalSpent),
            coverImage: tripData.cover_image,
            notes: detailsData?.notes || "",
            photoLink: detailsData?.photo_link || "",
            events: eventsData || [], 
            participants: participantsData || [],
            expenses: loadedExpenses
        });

        setNotes(detailsData?.notes || "");
        setPhotoLink(detailsData?.photo_link || "");
        setEditName(tripData.name);
        setEditDate(tripData.date);
        setEditCurrency(tripData.base_currency || "CZK");
        setEditBudget(tripData.total_budget || "");
        setEditImage(tripData.cover_image || "");
        setEditMapLink(tripData.map_link || "");
        const today = new Date().toISOString().split('T')[0];
        setNewEventDate(today);

    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, [shareCodeParam, router]);

  useEffect(() => { fetchTripData(); }, [fetchTripData]);

  const groupedEvents = useMemo(() => {
      if (!trip?.events) return {};
      return trip.events.reduce((groups, event) => {
          const date = event.date || 'Neurčeno';
          if (!groups[date]) groups[date] = [];
          groups[date].push(event);
          return groups;
      }, {} as Record<string, Event[]>);
  }, [trip?.events]);
  const sortedDates = Object.keys(groupedEvents).sort();

  const addParticipant = async (e: React.FormEvent) => { e.preventDefault(); if (!newParticipant || !trip) return; await supabase.from('participants').insert([{ trip_id: trip.id, name: newParticipant }]); setNewParticipant(""); fetchTripData(); };
  const deleteParticipant = async (id: number) => { await supabase.from('participants').delete().eq('id', id); fetchTripData(); };
  const addExpense = async (expenseData: Omit<Expense, "id">) => { if (!trip) return; const dbPayload = { trip_id: trip.id, title: expenseData.title, amount: expenseData.amount, currency: expenseData.currency, exchange_rate: expenseData.exchangeRate, payer: expenseData.payer, category: expenseData.category, split_method: expenseData.splitMethod, split_details: expenseData.splitDetails, for_whom: expenseData.forWhom, is_settlement: expenseData.isSettlement }; await supabase.from('expenses').insert([dbPayload]); fetchTripData(); };
  const deleteExpense = async (id: number) => { await supabase.from('expenses').delete().eq('id', id); fetchTripData(); };
  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => { setNotes(e.target.value); };
  const saveDetails = async () => { if(!trip) return; const { data } = await supabase.from('trip_details').select('id').eq('trip_id', trip.id).maybeSingle(); if (data) await supabase.from('trip_details').update({ notes, photo_link: photoLink }).eq('trip_id', trip.id); else await supabase.from('trip_details').insert([{ trip_id: trip.id, notes, photo_link: photoLink }]); };
  const changeColor = async (newColor: string) => { if(!trip) return; await supabase.from('trips').update({ color: newColor, cover_image: null }).eq('id', trip.id); fetchTripData(); };
  const addEvent = async (e: React.FormEvent) => { e.preventDefault(); if (!newEventTitle || !newEventTime || !trip) return; await supabase.from('events').insert([{ trip_id: trip.id, title: newEventTitle, time: newEventTime, date: newEventDate || 'Neurčeno', color: newEventColor }]); setNewEventTitle(""); setNewEventTime(""); fetchTripData(); };
  const deleteEvent = async (id: number) => { await supabase.from('events').delete().eq('id', id); fetchTripData(); };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!trip) return;
    const { error } = await supabase.from('trips').update({ name: editName, date: editDate, base_currency: editCurrency, total_budget: editBudget ? Number(editBudget) : 0, cover_image: editImage, map_link: editMapLink }).eq('id', trip.id);
    if (!error) { alert("Nastavení uloženo! ✅"); fetchTripData(); } else { alert("Chyba: " + error.message); }
  };

  const handleDeleteTrip = async () => {
      if(!trip) return;
      if(confirm("Opravdu smazat celý trip? Tato akce je nevratná.")) {
          const { error } = await supabase.from('trips').delete().eq('id', trip.id);
          if(!error) router.push('/');
          else alert("Chyba při mazání: " + error.message);
      }
  };

  const copyShareCode = () => { if(trip?.shareCode) { const url = `https://tripenzi.netlify.app/trip/${trip.shareCode}`; navigator.clipboard.writeText(url); alert("Odkaz zkopírován: " + url); } };

  if (loading || !trip) return <div className="p-10 text-center flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div></div>;

  const headerStyle = trip.coverImage ? { backgroundImage: `url(${trip.coverImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {};
  const headerClass = trip.coverImage ? "relative text-white" : `bg-gradient-to-r ${trip.color} text-white relative`;
  const shareUrl = `https://tripenzi.netlify.app/trip/${trip.shareCode}`;

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-sans max-w-md mx-auto relative">
      <div className={`${headerClass} p-6 pb-16 transition-all duration-500`} style={headerStyle}>
        {trip.coverImage && <div className="absolute inset-0 bg-black/40"></div>}
        <div className="relative z-10">
            <div className="mb-6 flex justify-between items-center">
                <Link href="/" className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition backdrop-blur-md inline-flex"><ArrowLeft /></Link>
                <div className="bg-green-500/80 px-2 py-1 rounded text-[10px] font-bold text-white flex items-center gap-1">Online ☁️</div>
            </div>
            <div>
                <h1 className="text-3xl font-bold drop-shadow-md">{trip.name}</h1>
                <p className="opacity-95 flex items-center gap-2 text-sm mt-1 drop-shadow-sm font-medium"><ClockIcon /> {trip.date}</p>
                <div className="mt-4 flex items-center gap-4 text-sm font-medium bg-black/30 p-2 rounded-lg inline-flex backdrop-blur-md border border-white/10"><span>💰 Útrata: {trip.spent} {trip.baseCurrency}</span></div>
            </div>
        </div>
      </div>

      <div className="-mt-8 bg-white rounded-t-3xl min-h-screen relative z-10 flex flex-col">
        <div className="flex border-b border-gray-100">
          <button onClick={() => setActiveTab('plan')} className={`flex-1 py-4 text-xs font-bold flex flex-col items-center gap-1 ${activeTab === 'plan' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400'}`}><ListIcon /> PLÁN</button>
          <button onClick={() => setActiveTab('budget')} className={`flex-1 py-4 text-xs font-bold flex flex-col items-center gap-1 ${activeTab === 'budget' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400'}`}><WalletIcon /> ROZPOČET</button>
          <button onClick={() => setActiveTab('info')} className={`flex-1 py-4 text-xs font-bold flex flex-col items-center gap-1 ${activeTab === 'info' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400'}`}><InfoIcon /> INFO</button>
          <button onClick={() => setActiveTab('settings')} className={`flex-1 py-4 text-xs font-bold flex flex-col items-center gap-1 ${activeTab === 'settings' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400'}`}><SettingsIcon /> NASTAVENÍ</button>
        </div>

        <div className="p-6 flex-1">
          {activeTab === 'plan' && (
            <div className="space-y-6 pb-24">
                {trip.mapLink && (<a href={trip.mapLink} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 w-full py-3 bg-blue-50 text-blue-700 rounded-xl font-bold border border-blue-100 mb-6 hover:bg-blue-100 transition"><MapIcon /> Otevřít mapu trasy</a>)}
              {(trip.events || []).length === 0 && <p className="text-gray-400 text-sm italic text-center mt-10">Zatím žádný plán.</p>}
              
              {sortedDates.map(date => (
                  <div key={date} className="relative">
                      <div className="sticky top-0 bg-white/95 backdrop-blur py-2 z-10 border-b border-gray-50 mb-3"><h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">📅 {date === 'Neurčeno' ? 'Ostatní' : new Date(date).toLocaleDateString('cs-CZ', { weekday: 'short', day: 'numeric', month: 'long' })}</h3></div>
                      <div className="space-y-0 border-l-2 border-gray-100 ml-2 pl-4 relative">
                          {groupedEvents[date].map((event) => (
                            <div key={event.id} className="relative group pb-6 last:pb-0">
                              <div className={`absolute -left-[21px] top-1 w-3 h-3 ${event.color || 'bg-blue-500'} rounded-full border-2 border-white shadow-sm`}></div>
                              <div className="flex justify-between items-start">
                                <div><span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded mb-1 inline-block">{event.time}</span><p className="text-gray-900 font-medium">{event.title}</p></div>
                                <button onClick={() => deleteEvent(event.id)} className="text-gray-300 hover:text-red-500 opacity-100"><TrashIcon /></button>
                              </div>
                            </div>
                          ))}
                      </div>
                  </div>
              ))}

              <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 max-w-md mx-auto z-20">
                <form onSubmit={addEvent} className="flex flex-col gap-3">
                  <div className="flex gap-2">
                      <input type="date" value={newEventDate} onChange={e => setNewEventDate(e.target.value)} className="bg-gray-100 rounded-xl px-3 py-3 font-bold text-xs focus:outline-blue-500 w-1/3" required />
                      <input type="time" value={newEventTime} onChange={e => setNewEventTime(e.target.value)} className="bg-gray-100 rounded-xl px-3 py-3 font-bold text-xs focus:outline-blue-500 w-1/4" required />
                      <div className="flex gap-1 items-center bg-gray-100 rounded-xl px-2 flex-1 justify-center">
                          {DOT_COLORS.map(c => (
                              <button key={c} type="button" onClick={() => setNewEventColor(c)} className={`w-4 h-4 rounded-full ${c} ${newEventColor === c ? 'ring-2 ring-offset-1 ring-gray-400' : ''}`}></button>
                          ))}
                      </div>
                  </div>
                  <div className="flex gap-2"><input type="text" value={newEventTitle} onChange={e => setNewEventTitle(e.target.value)} placeholder="Co podniknem?" className="bg-gray-100 rounded-xl px-4 py-3 flex-1 text-sm focus:outline-blue-500" required /><button type="submit" className="bg-blue-600 text-white w-12 rounded-xl flex items-center justify-center hover:bg-blue-700 shadow-lg font-bold text-xl">+</button></div>
                </form>
              </div>
            </div>
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
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><UsersIcon /> Účastníci</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {(trip.participants || []).length === 0 && <p className="text-gray-400 text-sm italic w-full">Zatím nikdo připsaný.</p>}
                  {trip.participants?.map((participant) => (
                    <div key={participant.id} className="bg-blue-50 text-blue-800 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2 border border-blue-100">
                      {participant.name} <button onClick={() => deleteParticipant(participant.id)} className="text-blue-300 hover:text-red-500 text-xs font-bold">×</button>
                    </div>
                  ))}
                </div>
                <form onSubmit={addParticipant} className="flex gap-2"><input type="text" value={newParticipant} onChange={(e) => setNewParticipant(e.target.value)} placeholder="Přidat jméno..." className="bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm flex-1 focus:outline-blue-500" /><button type="submit" className="bg-blue-600 text-white px-4 rounded-lg text-sm font-bold hover:bg-blue-700">+</button></form>
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><PhotoIcon /> Sdílené fotky</h3>
                <div className="flex gap-2"><input type="text" value={photoLink} onChange={(e) => setPhotoLink(e.target.value)} placeholder="Vlož odkaz na Google Photos..." className="bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm flex-1 focus:outline-blue-500" /><button onClick={saveDetails} className="bg-blue-600 text-white px-4 rounded-lg text-sm font-bold hover:bg-blue-700">Uložit</button></div>
                {trip.photoLink && (<div className="mt-2"><a href={trip.photoLink} target="_blank" rel="noreferrer" className="block bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 rounded-xl text-center font-bold shadow-md hover:opacity-90 transition">📸 Otevřít Galerii</a></div>)}
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 shadow-sm"><h3 className="font-bold text-yellow-800 mb-2">📝 Důležité poznámky</h3><textarea value={notes} onChange={handleNoteChange} onBlur={saveDetails} placeholder="Zde si napiš kód od wifi, adresu..." className="w-full bg-transparent text-sm text-gray-800 placeholder-gray-400 focus:outline-none h-40 resize-none" /><p className="text-[10px] text-yellow-600 mt-1 text-right">Ukládá se automaticky po dopsání</p></div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 mb-6"><h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2"><Share2Icon /> Sdílení tripu</h3><div className="bg-white p-3 rounded-xl flex justify-between items-center border border-blue-200"><span className="font-mono text-xl font-bold tracking-widest text-blue-600">{trip.shareCode}</span><button onClick={copyShareCode} className="text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg font-bold hover:bg-blue-200">Kopírovat</button></div><p className="text-[10px] text-blue-700 mt-2">Tento odkaz pošli kamarádům. Připojí se přímo.</p><div className="mt-3 flex justify-center"><img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(shareUrl)}`} alt="QR Code" className="rounded-xl border-4 border-white shadow-sm" /></div></div>
              <h2 className="text-lg font-bold text-gray-800">Upravit Trip</h2>
              <form onSubmit={handleUpdateSettings} className="space-y-4">
                <div><label className="block text-xs font-bold text-gray-500 mb-1">NÁZEV CESTY</label><input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 font-bold focus:outline-blue-500" /></div>
                <div><label className="block text-xs font-bold text-gray-500 mb-1">TERMÍN (TEXT)</label><input type="text" value={editDate} onChange={(e) => setEditDate(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:outline-blue-500" /></div>
                <div><label className="block text-xs font-bold text-gray-500 mb-1">CELKOVÝ ROZPOČET</label><input type="number" value={editBudget} onChange={(e) => setEditBudget(e.target.value)} placeholder="0" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 font-bold focus:outline-blue-500" /></div>
                <div><label className="block text-xs font-bold text-gray-500 mb-1">ODKAZ NA MAPU (Mapy.cz/Google)</label><input type="text" value={editMapLink} onChange={(e) => setEditMapLink(e.target.value)} placeholder="https://mapy.cz/..." className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-blue-500" /></div>
                <div><label className="block text-xs font-bold text-gray-500 mb-1">HLAVNÍ MĚNA</label><div className="flex flex-wrap gap-2">{CURRENCIES.map(c => (<button type="button" key={c} onClick={() => setEditCurrency(c)} className={`px-3 py-1 rounded-lg border text-sm font-bold ${editCurrency === c ? 'bg-black text-white' : 'bg-white text-gray-500'}`}>{c}</button>))}</div></div>
                <div><label className="block text-xs font-bold text-gray-500 mb-1">OBRÁZEK POZADÍ (URL)</label><input type="text" value={editImage} onChange={(e) => setEditImage(e.target.value)} placeholder="https://..." className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-blue-500" /></div>
                <hr className="border-gray-100" />
                <div><label className="block text-xs font-bold text-gray-500 mb-2">NEBO VYBER BARVU</label><div className="grid grid-cols-3 gap-2">{GRADIENTS.map((gradient) => (<button key={gradient} type="button" onClick={() => changeColor(gradient)} className={`h-12 rounded-lg bg-gradient-to-r ${gradient} flex items-center justify-center transform hover:scale-105 transition`}>{trip.color === gradient && !editImage && <div className="text-white drop-shadow-md"><CheckIcon /></div>}</button>))}</div></div>
                <button type="submit" className="w-full py-4 bg-black text-white rounded-xl font-bold text-lg mt-4 shadow-lg hover:bg-gray-800 transition">ULOŽIT ZMĚNY</button>
              </form>
              <button onClick={handleDeleteTrip} className="w-full py-4 bg-white border-2 border-red-100 text-red-600 rounded-xl font-bold text-lg mt-8 hover:bg-red-50 transition shadow-sm flex items-center justify-center gap-2"><TrashIcon /> SMAZAT TRIP</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}