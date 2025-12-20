"use client";

import React, { useState, useEffect, useCallback } from 'react'; // Přidán useCallback
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient'; // <--- TOTO JE MOST K DATABÁZI

// --- IKONY ---
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>;
const MapPinIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>;
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>;
const LogOutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>;

// --- TYPY ---
type User = {
  id: number;       // ID v databázi (bigint)
  custom_id: string; // Naše ID #1234
  name: string;
};

export default function TripenziApp() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [trips, setTrips] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDestination, setNewDestination] = useState("");
  const [newDate, setNewDate] = useState("");
  const [loading, setLoading] = useState(true);

  // Auth Stavy
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authInputName, setAuthInputName] = useState("");
  const [authInputID, setAuthInputID] = useState("");
  const [authError, setAuthError] = useState("");

  // 1. NAČTENÍ DAT (Z DATABÁZE)
  const loadTrips = useCallback(async () => {
    if (!currentUser) return;

    // SUPABASE: Vyber všechny tripy, kde owner_id je moje ID
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .eq('owner_id', currentUser.custom_id)
      .order('id', { ascending: false });

    if (error) {
      console.error("Chyba načítání tripů:", error);
    } else {
      // Musíme dopočítat útratu (spent), protože ta se teď počítá z tabulky expenses
      // Pro zjednodušení na hlavní stránce zatím načteme 0, nebo bychom museli dělat složitější join.
      // Pro teď necháme 0 a útratu vyřešíme v detailu, nebo později přidáme funkci na součet.
      
      // Ale počkej! Můžeme načíst i výdaje a spočítat to rovnou tady.
      // Uděláme to jednoduše - pro každý trip načteme sumu výdajů.
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
    // Kontrola, zda je uživatel přihlášen (uloženo v prohlížeči jen jako session)
    const sessionUser = localStorage.getItem("tripenzi_session");
    if (sessionUser) {
      setCurrentUser(JSON.parse(sessionUser));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadTrips();
    }
  }, [currentUser, loadTrips]);

  // Listener pro aktualizaci při návratu z detailu
  useEffect(() => {
      window.addEventListener("focus", loadTrips); // Když se vrátíš na záložku
      return () => window.removeEventListener("focus", loadTrips);
  }, [loadTrips]);


  // --- AUTH LOGIKA (SUPABASE) ---

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authInputName.trim()) return;
    setAuthError("");

    const randomId = `#${Math.floor(1000 + Math.random() * 9000)}`;

    // SUPABASE: Vložit nového uživatele
    const { data, error } = await supabase
      .from('users')
      .insert([{ custom_id: randomId, name: authInputName }])
      .select()
      .single();

    if (error) {
      setAuthError("Chyba při registraci. Zkus to znovu.");
      console.error(error);
    } else if (data) {
      loginUser(data);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authInputID.trim()) return;
    setAuthError("");

    const searchID = authInputID.startsWith('#') ? authInputID : `#${authInputID}`;

    // SUPABASE: Najít uživatele
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('custom_id', searchID)
      .single();

    if (error || !data) {
      setAuthError("Uživatel s tímto ID neexistuje.");
    } else {
      loginUser(data);
    }
  };

  const loginUser = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem("tripenzi_session", JSON.stringify(user));
    setAuthInputName("");
    setAuthInputID("");
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setTrips([]);
    localStorage.removeItem("tripenzi_session");
    setAuthMode("login");
  };

  // --- TRIP LOGIKA (SUPABASE) ---

  const handleAddTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDestination || !newDate || !currentUser) return;

    const colors = ["from-blue-500 to-cyan-400", "from-purple-500 to-indigo-500", "from-green-400 to-emerald-500", "from-yellow-400 to-orange-500", "from-pink-500 to-rose-500"];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    // SUPABASE: Vložit nový trip
    const { error } = await supabase
      .from('trips')
      .insert([{ 
          name: newDestination, 
          date: newDate, 
          color: randomColor, 
          owner_id: currentUser.custom_id,
          base_currency: 'CZK',
          total_budget: 0
      }]);

    if (error) {
        alert("Chyba při vytváření tripu");
        console.error(error);
    } else {
        await loadTrips(); // Znovu načíst seznam
        setIsModalOpen(false);
        setNewDestination("");
        setNewDate("");
    }
  };

  const deleteTrip = async (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    if (confirm("Opravdu smazat tento trip?")) {
      // SUPABASE: Smazat trip (díky cascade se smažou i výdaje)
      const { error } = await supabase.from('trips').delete().eq('id', id);
      
      if (error) {
          alert("Chyba při mazání");
      } else {
          loadTrips();
      }
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50">Načítám...</div>;

  // --- 1. OBRAZOVKA: LOGIN / REGISTER ---
  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50 font-sans">
        <div className="w-full max-w-sm bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
          
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-gray-900 mb-2">Tripenzí</h1>
            <p className="text-gray-500 text-sm">Online & Offline Sync ☁️</p>
          </div>

          <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
            <button onClick={() => {setAuthMode('login'); setAuthError('');}} className={`flex-1 py-2 text-sm font-bold rounded-lg transition ${authMode === 'login' ? 'bg-white shadow text-black' : 'text-gray-400'}`}>Přihlásit</button>
            <button onClick={() => {setAuthMode('register'); setAuthError('');}} className={`flex-1 py-2 text-sm font-bold rounded-lg transition ${authMode === 'register' ? 'bg-white shadow text-black' : 'text-gray-400'}`}>Vytvořit účet</button>
          </div>

          {authMode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Tvoje ID</label>
                <input type="text" value={authInputID} onChange={(e) => setAuthInputID(e.target.value)} placeholder="#1234" className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl p-4 text-center font-mono text-xl font-bold tracking-widest focus:outline-blue-500 uppercase placeholder-gray-300" />
              </div>
              {authError && <p className="text-red-500 text-xs text-center font-bold">{authError}</p>}
              <button type="submit" className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-gray-800 transition active:scale-95">Vstoupit</button>
            </form>
          )}

          {authMode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Jak ti říkají?</label>
                <input type="text" value={authInputName} onChange={(e) => setAuthInputName(e.target.value)} placeholder="Např. Lukáš" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 font-bold text-lg focus:outline-blue-500" />
              </div>
              <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 text-yellow-800 text-xs">ℹ️ Vygenerujeme ti unikátní <strong>ID</strong>, které bude uloženo v cloudu.</div>
              <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-blue-700 transition active:scale-95">Získat ID a vstoupit</button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // --- 2. OBRAZOVKA: DASHBOARD ---
  return (
    <div className="min-h-screen pb-24 font-sans max-w-md mx-auto relative overflow-hidden">
      
      {/* HLAVIČKA */}
      <header className="pt-12 pb-6 px-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Ahoj, {currentUser.name}</p>
            <h1 className="text-3xl font-bold text-gray-900">Moje Cesty</h1>
          </div>
          <div className="flex items-center gap-2">
             <div className="bg-gray-100 px-3 py-1 rounded-full text-xs font-mono font-bold text-gray-600 border border-gray-200">{currentUser.custom_id}</div>
             <button onClick={handleLogout} className="w-10 h-10 rounded-full bg-gray-200 hover:bg-red-100 hover:text-red-600 border-2 border-white shadow-sm flex items-center justify-center transition"><LogOutIcon /></button>
          </div>
        </div>
      </header>

      {/* SEZNAM CEST */}
      <div className="px-6 space-y-5">
        {trips.length === 0 && (
          <div className="text-center text-gray-400 py-10"><p>Zatím žádné plány... 🌍</p><p className="text-xs mt-2">Data se ukládají online!</p></div>
        )}

        {trips.map((trip) => {
          const budgetLimit = Number(trip.total_budget) || 0;
          const currency = trip.base_currency || "CZK";
          
          return (
          <Link href={`/trip/${trip.id}`} key={trip.id} className="block">
            <div className="bg-white rounded-3xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all cursor-pointer border border-gray-50 group relative">
              
              <button 
                onClick={(e) => deleteTrip(trip.id, e)}
                className="absolute top-4 right-4 z-10 p-2 bg-white/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100 hover:text-red-600"
              >
                <TrashIcon />
              </button>

              <div 
                className={`h-32 rounded-2xl mb-4 relative overflow-hidden ${!trip.cover_image ? `bg-gradient-to-r ${trip.color}` : ''}`}
                style={trip.cover_image ? { backgroundImage: `url(${trip.cover_image})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
              >
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors"></div>
                <div className="absolute bottom-3 left-3 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-medium border border-white/20">
                   {trip.date || "Bez data"}
                </div>
              </div>

              <div className="px-1">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="text-lg font-bold text-gray-900">{trip.name}</h3>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded font-bold text-gray-600">Online</span>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1"><CalendarIcon /> {trip.date}</div>
                </div>

                <div className="bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-500 ${trip.spent > budgetLimit && budgetLimit > 0 ? 'bg-red-500' : 'bg-gray-900'}`} style={{ width: budgetLimit > 0 ? `${Math.min((trip.spent / budgetLimit) * 100, 100)}%` : (trip.spent > 0 ? '100%' : '0%') }}></div>
                </div>
                <div className="flex justify-between text-xs mt-2 font-medium">
                  <span className="text-gray-500">Útrata: {trip.spent} {currency}</span>
                  <span className="text-gray-900">Limit: {budgetLimit > 0 ? `${budgetLimit} ${currency}` : '∞'}</span>
                </div>
              </div>
            </div>
          </Link>
        )})}
      </div>

      <button onClick={() => setIsModalOpen(true)} className="fixed bottom-8 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg shadow-blue-600/30 flex items-center justify-center transition-transform active:scale-90 z-40"><PlusIcon /></button>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl relative z-10 animate-in fade-in zoom-in duration-200">
            <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">Nový Trip</h2>
            <form onSubmit={handleAddTrip} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">Destinace</label>
                <div className="relative"><span className="absolute left-3 top-3 text-gray-400"><MapPinIcon /></span><input type="text" value={newDestination} onChange={(e) => setNewDestination(e.target.value)} placeholder="Např. Paříž" className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500" autoFocus /></div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">Kdy?</label>
                <div className="relative"><span className="absolute left-3 top-3 text-gray-400"><CalendarIcon /></span><input type="text" value={newDate} onChange={(e) => setNewDate(e.target.value)} placeholder="Např. 15. Července" className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-gray-600 font-semibold rounded-xl hover:bg-gray-100">Zrušit</button>
                <button type="submit" className="flex-1 py-3 bg-blue-600 text-white font-semibold rounded-xl shadow-lg hover:bg-blue-700">Vytvořit</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}