"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import Logo from '@/components/Logo';

// --- IKONY ---
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>;
const MapPinIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>;
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>;
const LogOutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>;
const LinkIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>;

type User = { id: number; custom_id: string; name: string; };

export default function TripenziApp() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [trips, setTrips] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  
  const [newDestination, setNewDestination] = useState("");
  const [newDate, setNewDate] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authInputName, setAuthInputName] = useState("");
  const [authInputID, setAuthInputID] = useState("");
  const [authError, setAuthError] = useState("");

  const loadTrips = useCallback(async () => {
    if (!currentUser) return;
    const { data: memberData } = await supabase.from('trip_members').select('trip_id').eq('user_id', currentUser.custom_id);
    if (!memberData || memberData.length === 0) { setTrips([]); return; }
    
    const tripIds = memberData.map(m => m.trip_id);
    const { data, error } = await supabase.from('trips').select('*').in('id', tripIds).order('id', { ascending: false });

    if (!error && data) {
      const tripsWithSpent = await Promise.all(data.map(async (trip) => {
          const { data: expenses } = await supabase.from('expenses').select('amount, exchange_rate, is_settlement').eq('trip_id', trip.id);
          const spent = expenses?.reduce((sum, item) => {
             if (item.is_settlement) return sum;
             return sum + (item.amount * (item.exchange_rate || 1));
          }, 0) || 0;
          return { ...trip, spent: Math.round(spent) };
      }));
      setTrips(tripsWithSpent);
    }
  }, [currentUser]);

  useEffect(() => {
    const sessionUser = localStorage.getItem("tripenzi_session");
    if (sessionUser) setCurrentUser(JSON.parse(sessionUser));
    setLoading(false);
  }, []);

  useEffect(() => { if (currentUser) loadTrips(); }, [currentUser, loadTrips]);
  useEffect(() => { window.addEventListener("focus", loadTrips); return () => window.removeEventListener("focus", loadTrips); }, [loadTrips]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authInputName.trim()) return;
    const randomId = `#${Math.floor(1000 + Math.random() * 9000)}`;
    const { data, error } = await supabase.from('users').insert([{ custom_id: randomId, name: authInputName }]).select().single();
    if (data) loginUser(data);
    else setAuthError("Chyba registrace.");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authInputID.trim()) return;
    const searchID = authInputID.startsWith('#') ? authInputID : `#${authInputID}`;
    const { data, error } = await supabase.from('users').select('*').eq('custom_id', searchID).single();
    if (data) loginUser(data);
    else setAuthError("Uživatel nenalezen.");
  };

  const loginUser = (user: User) => { setCurrentUser(user); localStorage.setItem("tripenzi_session", JSON.stringify(user)); };
  const handleLogout = () => { setCurrentUser(null); setTrips([]); localStorage.removeItem("tripenzi_session"); setAuthMode("login"); };

  const generateShareCode = () => {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let result = "";
      for (let i = 0; i < 6; i++) { if (i === 3) result += "-"; result += chars.charAt(Math.floor(Math.random() * chars.length)); }
      return result;
  };

  const handleAddTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDestination || !newDate || !currentUser) return;
    const colors = ["from-blue-500 to-cyan-400", "from-purple-500 to-indigo-500", "from-green-400 to-emerald-500", "from-yellow-400 to-orange-500", "from-pink-500 to-rose-500"];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const shareCode = generateShareCode();
    const { data: tripData, error } = await supabase.from('trips').insert([{ name: newDestination, date: newDate, color: randomColor, owner_id: currentUser.custom_id, base_currency: 'CZK', total_budget: 0, share_code: shareCode }]).select().single();
    if (!error && tripData) {
        await supabase.from('trip_members').insert([{ trip_id: tripData.id, user_id: currentUser.custom_id }]);
        await supabase.from('participants').insert([{ trip_id: tripData.id, name: currentUser.name }]);
        await loadTrips(); setIsModalOpen(false); setNewDestination(""); setNewDate("");
    }
  };

  const handleJoinTrip = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!joinCode || !currentUser) return;
      const { data: trip, error } = await supabase.from('trips').select('id').eq('share_code', joinCode.toUpperCase()).single();
      if (error || !trip) { alert("Trip neexistuje."); return; }
      const { data: existing } = await supabase.from('trip_members').select('*').eq('trip_id', trip.id).eq('user_id', currentUser.custom_id).single();
      if (existing) { alert("Už jsi členem!"); return; }
      await supabase.from('trip_members').insert([{ trip_id: trip.id, user_id: currentUser.custom_id }]);
      await supabase.from('participants').insert([{ trip_id: trip.id, name: currentUser.name }]); 
      await loadTrips(); setIsJoinModalOpen(false); setJoinCode(""); alert("Úspěšně připojeno! 🚀");
  };

  const deleteTrip = async (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    if (confirm("Opravdu smazat nebo opustit tento trip?")) {
      const trip = trips.find(t => t.id === id);
      if (trip.owner_id === currentUser?.custom_id) await supabase.from('trips').delete().eq('id', id);
      else await supabase.from('trip_members').delete().eq('trip_id', id).eq('user_id', currentUser?.custom_id);
      loadTrips();
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-600"></div></div>;

  // --- LOGIN ---
  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 font-sans">
        <div className="w-full max-w-sm bg-white p-8 rounded-[2rem] shadow-2xl shadow-indigo-100 border border-white">
          <div className="flex justify-center mb-6"><Logo size="large" /></div>
          <p className="text-slate-400 text-center text-sm mb-8 font-medium">Tvoje cesty, plány a finance pod kontrolou.</p>
          <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-8">
            <button onClick={() => {setAuthMode('login'); setAuthError('');}} className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${authMode === 'login' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}>Přihlásit</button>
            <button onClick={() => {setAuthMode('register'); setAuthError('');}} className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${authMode === 'register' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}>Registrovat</button>
          </div>
          {authMode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div><label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest pl-1">Tvoje ID</label><input type="text" value={authInputID} onChange={(e) => setAuthInputID(e.target.value)} placeholder="#1234" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-center font-mono text-2xl font-bold tracking-widest text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all uppercase placeholder-slate-300" /></div>
              {authError && <p className="text-rose-500 text-xs text-center font-bold bg-rose-50 py-2 rounded-lg">{authError}</p>}
              <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-slate-200 hover:bg-slate-800 hover:scale-[1.02] active:scale-95 transition-all">Vstoupit</button>
            </form>
          )}
          {authMode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div><label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest pl-1">Jak ti říkají?</label><input type="text" value={authInputName} onChange={(e) => setAuthInputName(e.target.value)} placeholder="Např. Lukáš" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold text-lg text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder-slate-300" /></div>
              <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:scale-[1.02] active:scale-95 transition-all">Získat ID a vstoupit</button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // --- DASHBOARD ---
  return (
    <div className="min-h-screen pb-32 font-sans relative bg-slate-50/50">
      <header className="pt-14 pb-6 px-6 bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-30">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Vítej zpět, {currentUser.name}</p>
            <Logo size="normal" />
          </div>
          <div className="flex items-center gap-3">
             <div className="bg-slate-100 px-3 py-1.5 rounded-xl text-xs font-mono font-bold text-slate-600 border border-slate-200">{currentUser.custom_id}</div>
             <button onClick={handleLogout} className="w-10 h-10 rounded-full bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-500 border border-slate-200 shadow-sm flex items-center justify-center transition-colors"><LogOutIcon /></button>
          </div>
        </div>
      </header>
      
      <div className="px-6 space-y-6 mt-6">
        {trips.length === 0 && (
          <div className="text-center text-slate-400 py-20 flex flex-col items-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-300"><MapPinIcon /></div>
            <p className="font-bold text-slate-600">Zatím žádné plány...</p>
            <p className="text-sm opacity-70 mt-1">Klikni na + a naplánuj první trip!</p>
          </div>
        )}

        {trips.map((trip) => {
          const budgetLimit = Number(trip.total_budget) || 0;
          const currency = trip.base_currency || "CZK";
          const isOwner = trip.owner_id === currentUser.custom_id;
          
          return (
          <Link href={`/trip/${trip.id}`} key={trip.id} className="block group">
            <div className="bg-white rounded-[2rem] p-4 shadow-xl border border-slate-100 relative overflow-hidden transition-all hover:scale-[1.02] mb-6">
              
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  deleteTrip(trip.id, e);
                }}
                className="absolute top-5 right-5 z-20 w-10 h-10 flex items-center justify-center bg-white/90 backdrop-blur rounded-full text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all shadow-sm border border-slate-100"
              >
                <TrashIcon />
              </button>

              <div 
                className={`h-40 rounded-[1.5rem] mb-4 relative overflow-hidden ${!trip.cover_image ? `bg-gradient-to-br ${trip.color}` : ''}`}
                style={trip.cover_image ? { backgroundImage: `url(${trip.cover_image})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                   <div className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-lg text-white text-xs font-bold border border-white/20 shadow-sm flex items-center gap-2">
                     <CalendarIcon /> {trip.date || "Bez data"}
                   </div>
                </div>
              </div>

              <div className="px-1">
                  <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-bold text-slate-900 leading-tight">{trip.name}</h3>
                      <span className={`text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-lg font-black ${isOwner ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
                        {isOwner ? 'MOJE' : 'SDÍLENÉ'}
                      </span>
                  </div>
                  
                  <div className="bg-slate-100 h-2.5 rounded-full overflow-hidden mb-2 relative">
                    <div 
                        className={`h-full rounded-full transition-all duration-1000 ease-out ${trip.spent > budgetLimit && budgetLimit > 0 ? 'bg-rose-500' : 'bg-slate-800'}`} 
                        style={{ width: budgetLimit > 0 ? `${Math.min((trip.spent / budgetLimit) * 100, 100)}%` : (trip.spent > 0 ? '100%' : '0%') }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between text-[11px] font-bold text-slate-500 uppercase tracking-tight">
                    <span>Útrata: <span className="text-slate-900">{trip.spent.toLocaleString()} {currency}</span></span>
                    <span>Limit: {budgetLimit > 0 ? `${budgetLimit.toLocaleString()} ${currency}` : '∞'}</span>
                  </div>
              </div>
            </div>
          </Link>
        )})}
      </div>

      <div className="fixed bottom-8 right-6 flex flex-col gap-4 z-40">
          <button onClick={() => setIsJoinModalOpen(true)} className="w-14 h-14 bg-white text-indigo-600 border border-indigo-100 rounded-full shadow-xl shadow-indigo-100 flex items-center justify-center transition-transform active:scale-90 hover:scale-105" title="Připojit se"><LinkIcon /></button>
          <button onClick={() => setIsModalOpen(true)} className="w-16 h-16 bg-slate-900 text-white rounded-full shadow-2xl shadow-slate-400 flex items-center justify-center transition-transform active:scale-90 hover:scale-105"><PlusIcon /></button>
      </div>

      {isModalOpen && (<div className="fixed inset-0 z-50 flex items-center justify-center p-4"><div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div><div className="bg-white w-full max-w-sm rounded-[2rem] p-8 shadow-2xl relative z-10 animate-in fade-in zoom-in duration-200"><h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Nový Trip</h2><form onSubmit={handleAddTrip} className="space-y-4"><div><label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Destinace</label><div className="relative"><span className="absolute left-4 top-3.5 text-slate-400"><MapPinIcon /></span><input type="text" value={newDestination} onChange={(e) => setNewDestination(e.target.value)} placeholder="Např. Paříž" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 font-medium text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all pl-12" autoFocus /></div></div><div><label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Kdy?</label><div className="relative"><span className="absolute left-4 top-3.5 text-slate-400"><CalendarIcon /></span><input type="text" value={newDate} onChange={(e) => setNewDate(e.target.value)} placeholder="Např. 15. Července" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 font-medium text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all pl-12" /></div></div><div className="pt-4 flex gap-3"><button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition">Zrušit</button><button type="submit" className="flex-1 w-full py-3 rounded-xl font-bold bg-indigo-600 text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-transform flex items-center justify-center">Vytvořit</button></div></form></div></div>)}
      {isJoinModalOpen && (<div className="fixed inset-0 z-50 flex items-center justify-center p-4"><div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsJoinModalOpen(false)}></div><div className="bg-white w-full max-w-sm rounded-[2rem] p-8 shadow-2xl relative z-10 animate-in fade-in zoom-in duration-200"><h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Připojit se</h2><form onSubmit={handleJoinTrip} className="space-y-4"><div><label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Kód sdílení</label><input type="text" value={joinCode} onChange={(e) => setJoinCode(e.target.value)} placeholder="ABC-123" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 font-medium text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-center uppercase tracking-widest font-mono text-xl" autoFocus /></div><button type="submit" className="w-full py-4 rounded-2xl font-bold text-lg shadow-xl shadow-slate-200 bg-slate-900 text-white hover:bg-slate-800 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 mt-4">Hledat trip</button></form></div></div>)}
    </div>
  );
}