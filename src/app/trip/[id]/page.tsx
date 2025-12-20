"use client";

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import BudgetView from '@/components/BudgetView';

const ArrowLeft = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>;
const ClockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const WalletIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>;
const ListIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>;
const InfoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="16" y2="12"/><line x1="12" x2="12.01" y1="8" y2="8"/></svg>;
const PhotoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>;
const SettingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>;
const CheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>;

type Event = { id: number; time: string; title: string; };
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
};

const GRADIENTS = [
  "from-blue-500 to-cyan-400", "from-purple-500 to-indigo-500", "from-green-400 to-emerald-500",
  "from-yellow-400 to-orange-500", "from-pink-500 to-rose-500", "from-gray-700 to-black",
];

const CURRENCIES = ["CZK", "EUR", "USD", "PLN", "HRK", "GBP", "VND", "IDR"];

export default function TripDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [activeTab, setActiveTab] = useState<'plan' | 'budget' | 'info' | 'settings'>('plan');

  const [newEvent, setNewEvent] = useState("");
  const [newTime, setNewTime] = useState("");
  const [notes, setNotes] = useState("");
  const [photoLink, setPhotoLink] = useState("");
  const [isEditingLink, setIsEditingLink] = useState(false);
  const [newParticipant, setNewParticipant] = useState("");
  const [editName, setEditName] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editImage, setEditImage] = useState("");
  const [editCurrency, setEditCurrency] = useState("CZK");
  const [editBudget, setEditBudget] = useState("");

  useEffect(() => {
    const savedTrips = JSON.parse(localStorage.getItem("trips") || "[]");
    const foundTrip = savedTrips.find((t: Trip) => t.id === Number(resolvedParams.id));
    if (foundTrip) {
      if (!foundTrip.events) foundTrip.events = [];
      if (!foundTrip.expenses) foundTrip.expenses = [];
      if (!foundTrip.participants) foundTrip.participants = [];
      setTrip(foundTrip);
      setNotes(foundTrip.notes || "");
      setPhotoLink(foundTrip.photoLink || "");
      setEditName(foundTrip.name);
      setEditDate(foundTrip.date);
      setEditImage(foundTrip.coverImage || "");
      setEditCurrency(foundTrip.baseCurrency || "CZK");
      setEditBudget(foundTrip.totalBudget ? String(foundTrip.totalBudget) : "");
    } else { router.push("/"); }
  }, [resolvedParams.id, router]);

  const saveTrip = (updatedTrip: Trip) => {
    setTrip(updatedTrip);
    const allTrips = JSON.parse(localStorage.getItem("trips") || "[]");
    const newAllTrips = allTrips.map((t: Trip) => t.id === updatedTrip.id ? updatedTrip : t);
    localStorage.setItem("trips", JSON.stringify(newAllTrips));
    window.dispatchEvent(new Event("tripUpdated"));
  };

  const addEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent || !newTime || !trip) return;
    const event = { id: Date.now(), time: newTime, title: newEvent };
    const updatedTrip = { ...trip, events: [...(trip.events || []), event] };
    updatedTrip.events?.sort((a, b) => a.time.localeCompare(b.time));
    saveTrip(updatedTrip);
    setNewEvent("");
    setNewTime("");
  };
  const deleteEvent = (id: number) => {
    if (!trip) return;
    saveTrip({ ...trip, events: trip.events?.filter(e => e.id !== id) });
  };

  const addExpense = (expenseData: Omit<Expense, "id">) => {
    if (!trip) return;
    const expense = { id: Date.now(), ...expenseData };
    const newExpenses = [...(trip.expenses || []), expense];
    const newSpent = newExpenses.reduce((sum, item) => {
        if (item.isSettlement) return sum;
        const rate = item.exchangeRate || 1;
        return sum + (item.amount * rate);
    }, 0);
    saveTrip({ ...trip, expenses: newExpenses, spent: Math.round(newSpent) });
  };

  const deleteExpense = (id: number) => {
    if (!trip) return;
    const newExpenses = trip.expenses?.filter(e => e.id !== id) || [];
    const newSpent = newExpenses.reduce((sum, item) => {
        if (item.isSettlement) return sum;
        const rate = item.exchangeRate || 1;
        return sum + (item.amount * rate);
    }, 0);
    saveTrip({ ...trip, expenses: newExpenses, spent: Math.round(newSpent) });
  };

  const addParticipant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newParticipant || !trip) return;
    const participant = { id: Date.now(), name: newParticipant };
    const updatedTrip = { ...trip, participants: [...(trip.participants || []), participant] };
    saveTrip(updatedTrip);
    setNewParticipant("");
  };
  const deleteParticipant = (id: number) => {
    if (!trip) return;
    saveTrip({ ...trip, participants: trip.participants?.filter(p => p.id !== id) });
  };
  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value; setNotes(newText); if (trip) saveTrip({ ...trip, notes: newText });
  };
  const savePhotoLink = () => { if (trip) saveTrip({ ...trip, photoLink: photoLink }); setIsEditingLink(false); };
  
  const handleUpdateSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (trip) { 
        saveTrip({ 
            ...trip, 
            name: editName, 
            date: editDate, 
            coverImage: editImage, 
            baseCurrency: editCurrency,
            totalBudget: editBudget ? Number(editBudget) : 0
        }); 
        alert("Nastavení uloženo! ✅"); 
    }
  };
  const changeColor = (newColor: string) => { if (trip) { saveTrip({ ...trip, color: newColor, coverImage: "" }); setEditImage(""); } };

  if (!trip) return <div className="p-10 text-center">Načítám...</div>;

  const headerStyle = trip.coverImage ? { backgroundImage: `url(${trip.coverImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {};
  const headerClass = trip.coverImage ? "relative text-white" : `bg-gradient-to-r ${trip.color} text-white relative`;

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-sans max-w-md mx-auto relative">
      <div className={`${headerClass} p-6 pb-16 transition-all duration-500`} style={headerStyle}>
        {trip.coverImage && <div className="absolute inset-0 bg-black/40"></div>}
        <div className="relative z-10">
            <div className="mb-6 flex justify-between items-center">
                <Link href="/" className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition backdrop-blur-md inline-flex"><ArrowLeft /></Link>
            </div>
            <div>
                <h1 className="text-3xl font-bold drop-shadow-md">{trip.name}</h1>
                <p className="opacity-95 flex items-center gap-2 text-sm mt-1 drop-shadow-sm font-medium"><ClockIcon /> {trip.date}</p>
                <div className="mt-4 flex items-center gap-4 text-sm font-medium bg-black/30 p-2 rounded-lg inline-flex backdrop-blur-md border border-white/10"><span>💰 Útrata: {trip.spent} {trip.baseCurrency || "CZK"}</span></div>
            </div>
        </div>
      </div>

      <div className="-mt-8 bg-white rounded-t-3xl min-h-screen relative z-10 flex flex-col">
        <div className="flex border-b border-gray-100">
          <button onClick={() => setActiveTab('plan')} className={`flex-1 py-4 text-[10px] font-bold flex flex-col items-center gap-1 ${activeTab === 'plan' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400'}`}><ListIcon /> PLÁN</button>
          <button onClick={() => setActiveTab('budget')} className={`flex-1 py-4 text-[10px] font-bold flex flex-col items-center gap-1 ${activeTab === 'budget' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400'}`}><WalletIcon /> ROZPOČET</button>
          <button onClick={() => setActiveTab('info')} className={`flex-1 py-4 text-[10px] font-bold flex flex-col items-center gap-1 ${activeTab === 'info' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400'}`}><InfoIcon /> INFO</button>
          <button onClick={() => setActiveTab('settings')} className={`flex-1 py-4 text-[10px] font-bold flex flex-col items-center gap-1 ${activeTab === 'settings' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400'}`}><SettingsIcon /> NASTAVENÍ</button>
        </div>

        <div className="p-6 flex-1">
          {activeTab === 'plan' && (
            <div className="space-y-6 border-l-2 border-gray-100 ml-3 pl-6 relative pb-20">
              {(trip.events || []).length === 0 && <p className="text-gray-400 text-sm italic">Zatím žádný plán.</p>}
              {trip.events?.map((event) => (
                <div key={event.id} className="relative group">
                  <div className="absolute -left-[31px] top-1 w-4 h-4 bg-blue-500 rounded-full border-4 border-white shadow-sm"></div>
                  <div className="flex justify-between items-start">
                    <div><span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded mb-1 inline-block">{event.time}</span><p className="text-gray-900 font-medium">{event.title}</p></div>
                    <button onClick={() => deleteEvent(event.id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><TrashIcon /></button>
                  </div>
                </div>
              ))}
              <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 max-w-md mx-auto z-20">
                <form onSubmit={addEvent} className="flex gap-2">
                  <input type="time" value={newTime} onChange={e => setNewTime(e.target.value)} className="bg-gray-100 rounded-xl px-3 py-3 font-bold text-sm focus:outline-blue-500" required />
                  <input type="text" value={newEvent} onChange={e => setNewEvent(e.target.value)} placeholder="Co podniknem?" className="bg-gray-100 rounded-xl px-4 py-3 flex-1 text-sm focus:outline-blue-500" required />
                  <button type="submit" className="bg-blue-600 text-white w-12 rounded-xl flex items-center justify-center hover:bg-blue-700 shadow-lg font-bold text-xl">+</button>
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
                <form onSubmit={addParticipant} className="flex gap-2">
                    <input type="text" value={newParticipant} onChange={(e) => setNewParticipant(e.target.value)} placeholder="Přidat jméno..." className="bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm flex-1 focus:outline-blue-500" />
                    <button type="submit" className="bg-blue-600 text-white px-4 rounded-lg text-sm font-bold hover:bg-blue-700">+</button>
                </form>
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><PhotoIcon /> Sdílené fotky</h3>
                {!trip.photoLink || isEditingLink ? (
                  <div className="flex gap-2"><input type="text" value={photoLink} onChange={(e) => setPhotoLink(e.target.value)} placeholder="Vlož odkaz na Google Photos..." className="bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm flex-1 focus:outline-blue-500" /><button onClick={savePhotoLink} className="bg-blue-600 text-white px-4 rounded-lg text-sm font-bold hover:bg-blue-700">OK</button></div>
                ) : (
                  <div><a href={trip.photoLink} target="_blank" rel="noreferrer" className="block bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-xl text-center font-bold shadow-md hover:opacity-90 transition">📸 Otevřít Galerii</a><button onClick={() => setIsEditingLink(true)} className="text-xs text-gray-400 mt-2 hover:text-gray-600 underline">Upravit odkaz</button></div>
                )}
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 shadow-sm"><h3 className="font-bold text-yellow-800 mb-2">📝 Důležité poznámky</h3><textarea value={notes} onChange={handleNoteChange} placeholder="Zde si napiš kód od wifi, adresu..." className="w-full bg-transparent text-sm text-gray-800 placeholder-gray-400 focus:outline-none h-40 resize-none" /></div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-gray-800">Upravit Trip</h2>
              <form onSubmit={handleUpdateSettings} className="space-y-4">
                <div><label className="block text-xs font-bold text-gray-500 mb-1">NÁZEV CESTY</label><input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 font-bold focus:outline-blue-500" /></div>
                <div><label className="block text-xs font-bold text-gray-500 mb-1">TERMÍN (TEXT)</label><input type="text" value={editDate} onChange={(e) => setEditDate(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:outline-blue-500" /></div>
                <div><label className="block text-xs font-bold text-gray-500 mb-1">CELKOVÝ ROZPOČET</label><input type="number" value={editBudget} onChange={(e) => setEditBudget(e.target.value)} placeholder="0" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 font-bold focus:outline-blue-500" /></div>
                <div><label className="block text-xs font-bold text-gray-500 mb-1">HLAVNÍ MĚNA</label><div className="flex flex-wrap gap-2">{CURRENCIES.map(c => (<button type="button" key={c} onClick={() => setEditCurrency(c)} className={`px-3 py-1 rounded-lg border text-sm font-bold ${editCurrency === c ? 'bg-black text-white' : 'bg-white text-gray-500'}`}>{c}</button>))}</div></div>
                <div><label className="block text-xs font-bold text-gray-500 mb-1">OBRÁZEK POZADÍ (URL)</label><input type="text" value={editImage} onChange={(e) => setEditImage(e.target.value)} placeholder="https://..." className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-blue-500" /></div>
                <hr className="border-gray-100" />
                <div><label className="block text-xs font-bold text-gray-500 mb-2">NEBO VYBER BARVU</label><div className="grid grid-cols-3 gap-2">{GRADIENTS.map((gradient) => (<button key={gradient} type="button" onClick={() => changeColor(gradient)} className={`h-12 rounded-lg bg-gradient-to-r ${gradient} flex items-center justify-center transform hover:scale-105 transition`}>{trip.color === gradient && !editImage && <div className="text-white drop-shadow-md"><CheckIcon /></div>}</button>))}</div></div>
                <button type="submit" className="w-full py-4 bg-black text-white rounded-xl font-bold text-lg mt-4 shadow-lg hover:bg-gray-800 transition">ULOŽIT ZMĚNY</button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}