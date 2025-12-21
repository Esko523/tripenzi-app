"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Logo from '@/components/Logo';
import LoginView from '@/components/LoginView'; // Import nové komponenty

// --- IKONY ---
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>;
const MapPinIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>;
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>;
const LogOutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>;
const LinkIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>;
const SortIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="21" x2="14" y1="4" y2="4"/><line x1="10" x2="3" y1="4" y2="4"/><line x1="21" x2="12" y1="12" y2="12"/><line x1="8" x2="3" y1="12" y2="12"/><line x1="21" x2="16" y1="20" y2="20"/><line x1="12" x2="3" y1="20" y2="20"/><line x1="14" x2="14" y1="2" y2="6"/><line x1="8" x2="8" y1="10" y2="14"/><line x1="16" x2="16" y1="18" y2="22"/></svg>;

type User = { id: number; custom_id: string; name: string; avatar?: string; };
const AVATARS = ["👤", "😎", "🤠", "👽", "🤖", "👻", "🦊", "🐯", "🐼", "🦄"];

export default function TripenziApp() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [trips, setTrips] = useState<any[]>([]);
  
  const [filter, setFilter] = useState<'all' | 'future' | 'active' | 'past'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'alphabet'>('date');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const [newName, setNewName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(true);
  
  const [editUserName, setEditUserName] = useState("");
  const [editUserAvatar, setEditUserAvatar] = useState("👤");

  // Format data
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

  // Odpočet
  const getCountdownStatus = (startDate?: string, endDate?: string) => {
      if (!startDate) return null;
      const now = new Date();
      const start = new Date(startDate);
      const end = endDate ? new Date(endDate) : new Date(start);
      end.setHours(23, 59, 59);
      start.setHours(0, 0, 0);

      const diffStart = start.getTime() - now.getTime();
      const baseStyle = "bg-yellow-400 text-yellow-900 border-yellow-200";

      if (diffStart > 0) {
          const days = Math.floor(diffStart / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diffStart % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          if (days > 0) return { text: `⏳ Za ${days} dní`, style: baseStyle };
          return { text: `⏳ Za ${hours} hod`, style: baseStyle };
      }
      if (now <= end) {
         const totalDuration = end.getTime() - start.getTime();
         const totalDays = Math.ceil(totalDuration / (1000 * 60 * 60 * 24)) || 1;
         const elapsed = now.getTime() - start.getTime();
         const currentDay = Math.floor(elapsed / (1000 * 60 * 60 * 24)) + 1;
         return { text: `🚀 Den ${currentDay}/${totalDays}`, style: baseStyle };
      }
      return { text: "🏁 Skončilo", style: baseStyle };
  };

  const loadTrips = useCallback(async () => {
    if (!currentUser) return;
    const { data: memberData } = await supabase.from('trip_members').select('trip_id').eq('user_id', currentUser.custom_id);
    if (!memberData || memberData.length === 0) { setTrips([]); return; }
    
    const tripIds = memberData.map(m => m.trip_id);
    const { data, error } = await supabase.from('trips').select('*').in('id', tripIds);

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
    if (sessionUser) {
        const user = JSON.parse(sessionUser);
        setCurrentUser(user);
        setEditUserName(user.name);
        setEditUserAvatar(user.avatar || "👤");
    }
    setLoading(false);
  }, []);

  useEffect(() => { if (currentUser) loadTrips(); }, [currentUser, loadTrips]);

  const filteredAndSortedTrips = useMemo(() => {
      let result = [...trips];
      const now = new Date();

      if (filter !== 'all') {
          result = result.filter(trip => {
              const start = new Date(trip.start_date);
              const end = trip.end_date ? new Date(trip.end_date) : new Date(start);
              end.setHours(23, 59, 59);
              start.setHours(0, 0, 0);
              if (filter === 'future') return start > now;
              if (filter === 'active') return now >= start && now <= end;
              if (filter === 'past') return now > end;
              return true;
          });
      }

      result.sort((a, b) => {
          if (sortBy === 'alphabet') {
              return a.name.localeCompare(b.name);
          } else {
              const dateA = new Date(a.start_date || 0).getTime();
              const dateB = new Date(b.start_date || 0).getTime();
              return dateB - dateA;
          }
      });

      return result;
  }, [trips, filter, sortBy]);

  const loginUser = (user: User) => { 
      setCurrentUser(user); 
      localStorage.setItem("tripenzi_session", JSON.stringify(user)); 
      setEditUserName(user.name); 
      setEditUserAvatar(user.avatar || "👤"); 
  };
  
  const handleLogout = () => { 
      setCurrentUser(null); 
      setTrips([]); 
      localStorage.removeItem("tripenzi_session"); 
  };

  const handleUpdateProfile = async () => { if(!currentUser) return; const { error } = await supabase.from('users').update({ name: editUserName, avatar: editUserAvatar }).eq('id', currentUser.id); if(!error) { const updatedUser = { ...currentUser, name: editUserName, avatar: editUserAvatar }; loginUser(updatedUser); setIsProfileOpen(false); }};
  const generateShareCode = () => { const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"; let result = ""; for (let i = 0; i < 6; i++) { if (i === 3) result += "-"; result += chars.charAt(Math.floor(Math.random() * chars.length)); } return result; };

  const handleAddTrip = async (e: React.FormEvent) => {
    e.preventDefault(); if (!newName || !currentUser) return;
    const randomColor = ["from-blue-500 to-cyan-400", "from-purple-500 to-indigo-500", "from-green-400 to-emerald-500", "from-yellow-400 to-orange-500", "from-pink-500 to-rose-500"][Math.floor(Math.random() * 4)];
    const shareCode = generateShareCode();
    const { data: tripData, error } = await supabase.from('trips').insert([{ name: newName, color: randomColor, owner_id: currentUser.custom_id, base_currency: 'CZK', total_budget: 0, share_code: shareCode }]).select().single();
    if (!error && tripData) { await supabase.from('trip_members').insert([{ trip_id: tripData.id, user_id: currentUser.custom_id }]); await supabase.from('participants').insert([{ trip_id: tripData.id, name: currentUser.name }]); await loadTrips(); setIsModalOpen(false); setNewName(""); router.push(`/trip/${shareCode}?tab=settings`); }
  };

  const handleJoinTrip = async (e: React.FormEvent) => {
      e.preventDefault(); if (!joinCode || !currentUser) return;
      const { data: trip, error } = await supabase.from('trips').select('id, share_code').eq('share_code', joinCode.toUpperCase()).single();
      if (error || !trip) { alert("Trip neexistuje."); return; }
      const { data: existing } = await supabase.from('trip_members').select('*').eq('trip_id', trip.id).eq('user_id', currentUser.custom_id).single();
      if (existing) { alert("Už jsi členem!"); return; }
      await supabase.from('trip_members').insert([{ trip_id: trip.id, user_id: currentUser.custom_id }]); await supabase.from('participants').insert([{ trip_id: trip.id, name: currentUser.name }]); router.push(`/trip/${trip.share_code}`);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-600"></div></div>;

  const inputStyle = "w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 font-medium text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder-slate-400";
  const btnPrimary = "w-full py-4 rounded-2xl font-bold text-lg shadow-xl shadow-slate-200 bg-slate-900 text-white hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2";
  const btnAction = "w-full py-3 rounded-xl font-bold bg-indigo-600 text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-transform flex items-center justify-center";
  
  const cardStyle = "block bg-white rounded-[2rem] p-5 shadow-sm border border-slate-100 relative overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group mb-4 active:scale-[0.98]";
  
  const filterBtnBase = "px-4 py-2.5 rounded-full text-sm font-bold transition-all border flex-shrink-0 active:scale-95";
  const filterBtnActive = "bg-slate-900 text-white border-slate-900 shadow-md";
  const filterBtnInactive = "bg-white text-slate-500 border-slate-200 hover:bg-slate-50 shadow-sm";

  const ModalWrapper = ({ children, onClose }: { children: React.ReactNode, onClose: () => void }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
        <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl relative z-10 animate-in fade-in zoom-in duration-200 border border-white/50">
            {children}
        </div>
    </div>
  );

  // --- ZOBRAZENÍ LOGINU POKUD NENÍ UŽIVATEL ---
  if (!currentUser) {
    return <LoginView onLogin={loginUser} />;
  }

  // --- DOMOVSKÁ OBRAZOVKA (LOGGED IN) ---
  return (
    <div className="min-h-screen pb-32 font-sans relative bg-slate-50">
      
      {/* HEADER (Menší a bez sticky) */}
      <header className="bg-white border-b border-slate-100">
        {/* Řádek 1: Logo a Profil */}
        <div className="pt-6 pb-2 px-6 flex justify-between items-center">
          <div>
              <Logo size="normal" variant="full" />
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1 pl-1">Vítej zpět, {currentUser.name}</p>
          </div>
          <div className="flex items-center gap-3">
             <div className="bg-slate-100 px-3 py-1.5 rounded-xl text-xs font-mono font-bold text-slate-700 border border-slate-200 shadow-sm">{currentUser.custom_id}</div>
             <button onClick={() => setIsProfileOpen(true)} className="w-11 h-11 rounded-full bg-slate-100 border border-slate-200 shadow-sm flex items-center justify-center text-2xl hover:bg-slate-200 transition-transform active:scale-95">{currentUser.avatar || "👤"}</button>
          </div>
        </div>

        {/* Řádek 2: Filtry a Řazení */}
        <div className="px-6 pb-4 pt-2 flex items-center justify-between gap-3">
            <div className="flex gap-2 overflow-x-auto pb-2 pt-1 no-scrollbar flex-1 mask-linear-fade" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                <button onClick={() => setFilter('all')} className={`${filterBtnBase} ${filter === 'all' ? filterBtnActive : filterBtnInactive}`}>Vše</button>
                <button onClick={() => setFilter('future')} className={`${filterBtnBase} ${filter === 'future' ? filterBtnActive : filterBtnInactive}`}>Budoucí</button>
                <button onClick={() => setFilter('active')} className={`${filterBtnBase} ${filter === 'active' ? filterBtnActive : filterBtnInactive}`}>Probíhající</button>
                <button onClick={() => setFilter('past')} className={`${filterBtnBase} ${filter === 'past' ? filterBtnActive : filterBtnInactive}`}>Proběhlé</button>
            </div>
            
            <button 
                onClick={() => setSortBy(prev => prev === 'date' ? 'alphabet' : 'date')} 
                className="w-11 h-11 flex items-center justify-center bg-white rounded-full shadow-sm border border-slate-200 text-slate-500 hover:text-indigo-600 transition-colors flex-shrink-0 active:scale-90"
                title={`Řadit: ${sortBy === 'date' ? 'Podle data' : 'Abecedně'}`}
            >
                {sortBy === 'date' ? <SortIcon /> : <span className="text-xs font-black">A-Z</span>}
            </button>
        </div>
      </header>
      
      <div className="px-6 space-y-6 mt-6">
        {filteredAndSortedTrips.length === 0 && (
            <div className="text-center text-slate-400 py-20 flex flex-col items-center animate-in fade-in">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-300"><MapPinIcon /></div>
                <p className="font-bold text-slate-600">Žádné tripy v této kategorii...</p>
                {filter !== 'all' && <button onClick={() => setFilter('all')} className="text-indigo-500 text-sm font-bold mt-2">Zobrazit vše</button>}
            </div>
        )}
        
        {filteredAndSortedTrips.map((trip) => {
          const budgetLimit = Number(trip.total_budget) || 0;
          const currency = trip.base_currency || "CZK";
          const isOwner = trip.owner_id === currentUser.custom_id;
          const status = getCountdownStatus(trip.start_date, trip.end_date);
          
          return (
          <Link href={`/trip/${trip.share_code}`} key={trip.id} className={cardStyle}>
              <div className={`h-40 rounded-[1.5rem] mb-5 relative overflow-hidden ${!trip.cover_image ? `bg-gradient-to-br ${trip.color}` : ''}`} style={trip.cover_image ? { backgroundImage: `url(${trip.cover_image})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  
                  {status && (
                    <div className={`absolute top-3 right-3 px-2 py-1 rounded-lg text-[10px] font-black uppercase shadow-sm border transform rotate-2 ${status.style}`}>
                        {status.text}
                    </div>
                  )}

                  <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                      <div className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-lg text-white text-xs font-bold border border-white/20 shadow-sm flex items-center gap-2">
                          <CalendarIcon /> {formatDateRange(trip.start_date, trip.end_date, trip.date)}
                      </div>
                  </div>
              </div>
              
              <div className="px-1">
                  <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-bold text-slate-900 leading-tight">{trip.name}</h3>
                      <span className={`text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-lg font-black ${isOwner ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>{isOwner ? 'MOJE' : 'SDÍLENÉ'}</span>
                  </div>
                  <div className="bg-slate-100 h-2.5 rounded-full overflow-hidden mb-2 relative">
                      <div className={`h-full rounded-full transition-all duration-1000 ease-out ${trip.spent > budgetLimit && budgetLimit > 0 ? 'bg-rose-500' : 'bg-slate-800'}`} style={{ width: budgetLimit > 0 ? `${Math.min((trip.spent / budgetLimit) * 100, 100)}%` : (trip.spent > 0 ? '100%' : '0%') }}></div>
                  </div>
                  <div className="flex justify-between text-[11px] font-bold text-slate-500 uppercase tracking-tight">
                      <span>Útrata: <span className="text-slate-900">{trip.spent.toLocaleString()} {currency}</span></span>
                      <span>Limit: {budgetLimit > 0 ? `${budgetLimit.toLocaleString()} ${currency}` : '∞'}</span>
                  </div>
              </div>
          </Link>
        )})}
      </div>

      {/* TLAČÍTKA AKCÍ (Zarovnaná na střed pod sebou - items-center) */}
      <div className="fixed bottom-8 right-6 flex flex-col gap-4 items-center z-40">
        <button onClick={() => setIsJoinModalOpen(true)} className="w-14 h-14 bg-white text-indigo-600 border border-indigo-100 rounded-full shadow-xl shadow-indigo-100 flex items-center justify-center transition-transform active:scale-90 hover:scale-105">
            <LinkIcon />
        </button>
        <button onClick={() => setIsModalOpen(true)} className="w-16 h-16 bg-slate-900 text-white rounded-full shadow-2xl shadow-slate-400 flex items-center justify-center transition-transform active:scale-90 hover:scale-105">
            <PlusIcon />
        </button>
      </div>

      {isModalOpen && (
        <ModalWrapper onClose={() => setIsModalOpen(false)}>
            <h2 className="text-xl font-bold text-slate-900 mb-6 text-center">Nový Trip</h2>
            <form onSubmit={handleAddTrip} className="space-y-4">
                <div><label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider pl-1">Název cesty</label><input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Např. Paříž" className={inputStyle} autoFocus /></div>
                <div className="pt-2 flex gap-3"><button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition text-sm">Zrušit</button><button type="submit" className={btnAction}>Vytvořit</button></div>
            </form>
        </ModalWrapper>
      )}
      
      {isJoinModalOpen && (
        <ModalWrapper onClose={() => setIsJoinModalOpen(false)}>
            <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Připojit se</h2>
            <form onSubmit={handleJoinTrip} className="space-y-4">
                <div><label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Kód sdílení</label><input type="text" value={joinCode} onChange={(e) => setJoinCode(e.target.value)} placeholder="ABC-123" className={`${inputStyle} text-center text-2xl tracking-widest uppercase font-mono`} autoFocus /></div>
                <button type="submit" className={btnPrimary}>Hledat trip</button>
            </form>
        </ModalWrapper>
      )}

      {isProfileOpen && (
        <ModalWrapper onClose={() => setIsProfileOpen(false)}>
            <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Můj Profil</h2>
            <div className="space-y-6">
                <div className="flex justify-center"><div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center text-6xl shadow-inner border-4 border-white">{editUserAvatar}</div></div>
                <div className="flex justify-center gap-2 overflow-x-auto pb-2 no-scrollbar">{AVATARS.map(av => (<button key={av} onClick={() => setEditUserAvatar(av)} className={`text-2xl p-2 rounded-xl transition ${editUserAvatar === av ? 'bg-indigo-100 border-2 border-indigo-500' : 'hover:bg-slate-50'}`}>{av}</button>))}</div>
                <div><label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Jméno</label><input type="text" value={editUserName} onChange={e => setEditUserName(e.target.value)} className={inputStyle} /></div>
                <button onClick={handleUpdateProfile} className={btnPrimary}>Uložit změny</button>
                <button onClick={handleLogout} className="w-full py-3 text-rose-500 font-bold hover:bg-rose-50 rounded-xl transition flex items-center justify-center gap-2"><LogOutIcon /> Odhlásit se</button>
            </div>
        </ModalWrapper>
      )}
    </div>
  );
}