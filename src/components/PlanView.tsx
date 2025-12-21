"use client";

import React, { useState, useMemo } from 'react';

// --- IKONY ---
const MapIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" x2="9" y1="3" y2="18"/><line x1="15" x2="15" y1="6" y2="21"/></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>;
const SaveIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>;
const ExternalLinkIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" x2="21" y1="14" y2="3"/></svg>;
const PinIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>;
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>;
const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>;

type Event = { id: number; time: string; title: string; location?: string; date?: string; color?: string; };
type Trip = { mapLink?: string; start_date?: string; };

interface PlanProps {
  events: Event[];
  trip: Trip;
  onAddEvent: (event: { title: string; location: string; time: string; date: string; color: string }) => void;
  onDeleteEvent: (id: number) => void;
  onEditEvent: (id: number, data: { title: string; location: string; time: string; date: string; color: string }) => void;
}

const DOT_COLORS = ["bg-blue-500", "bg-red-500", "bg-green-500", "bg-yellow-500", "bg-purple-500", "bg-slate-500"];

export default function PlanView({ events, trip, onAddEvent, onDeleteEvent, onEditEvent }: PlanProps) {
  const [isAdding, setIsAdding] = useState(false);

  // Stavy pro nový event
  const [newTitle, setNewTitle] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newTime, setNewTime] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newColor, setNewColor] = useState("bg-blue-500");

  // Stavy pro editaci
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ title: "", location: "", time: "", date: "", color: "" });

  React.useEffect(() => {
      const today = new Date().toISOString().split('T')[0];
      setNewDate(trip.start_date || today);
  }, [trip.start_date]);

  const groupedEvents = useMemo(() => {
      if (!events) return {};
      return events.reduce((groups, event) => {
          const date = event.date || 'Neurčeno';
          if (!groups[date]) groups[date] = [];
          groups[date].push(event);
          return groups;
      }, {} as Record<string, Event[]>);
  }, [events]);
  
  const sortedDates = Object.keys(groupedEvents).sort();

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newTitle || !newTime) return;
      onAddEvent({ title: newTitle, location: newLocation, time: newTime, date: newDate || 'Neurčeno', color: newColor });
      setNewTitle(""); setNewLocation(""); setNewTime("");
      setIsAdding(false);
  };

  const startEditing = (event: Event) => {
      setEditingId(event.id);
      setEditForm({ 
          title: event.title, 
          location: event.location || "", 
          time: event.time, 
          date: event.date || newDate, 
          color: event.color || "bg-blue-500" 
      });
  };

  const saveEdit = () => {
      if (editingId) {
          onEditEvent(editingId, editForm);
          setEditingId(null);
      }
  };

  const getGoogleMapsLink = (location: string) => {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
  };

  const inputStyle = "w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 font-medium text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder-slate-400";

  return (
    <div className="space-y-6 pb-24">
        {trip.mapLink && (
            <a href={trip.mapLink} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 w-full py-3 bg-blue-50 text-blue-700 rounded-xl font-bold border border-blue-100 mb-6 hover:bg-blue-100 transition shadow-sm">
                <MapIcon /> Otevřít mapu trasy
            </a>
        )}
        
        {events.length === 0 && <div className="text-center py-10"><p className="text-gray-400 text-sm italic">Zatím žádný plán.</p><p className="text-xs text-gray-300 mt-1">Klikni na + a přidej první bod.</p></div>}
      
        {sortedDates.map(date => (
            <div key={date} className="relative">
                <div className="sticky top-0 bg-white/95 backdrop-blur py-3 z-10 border-b border-gray-50 mb-4">
                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2 pl-1">
                        📅 {date === 'Neurčeno' ? 'Ostatní' : new Date(date).toLocaleDateString('cs-CZ', { weekday: 'short', day: 'numeric', month: 'long' })}
                    </h3>
                </div>
                <div className="space-y-0 border-l-2 border-gray-100 ml-2 pl-5 relative pb-2">
                    {groupedEvents[date].map((event) => (
                        <div key={event.id} className="relative group pb-8 last:pb-2">
                            {editingId === event.id ? (
                                <div className="bg-gray-50 p-3 rounded-xl border border-blue-200 shadow-sm -ml-2 space-y-2">
                                    <div className="flex gap-2">
                                        <input type="time" value={editForm.time} onChange={e => setEditForm({...editForm, time: e.target.value})} className="bg-white border border-gray-200 rounded-lg px-2 py-2 text-xs font-bold w-20" />
                                        <input type="date" value={editForm.date} onChange={e => setEditForm({...editForm, date: e.target.value})} className="bg-white border border-gray-200 rounded-lg px-2 py-2 text-xs font-bold flex-1" />
                                    </div>
                                    <input type="text" value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} placeholder="Co?" className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold" />
                                    <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2">
                                        <PinIcon />
                                        <input type="text" value={editForm.location} onChange={e => setEditForm({...editForm, location: e.target.value})} placeholder="Kde? (pro mapu)" className="w-full text-xs font-medium focus:outline-none" />
                                    </div>
                                    <div className="flex justify-between items-center pt-1">
                                        <div className="flex gap-1">{DOT_COLORS.map(c => (<button key={c} type="button" onClick={() => setEditForm({...editForm, color: c})} className={`w-5 h-5 rounded-full ${c} ${editForm.color === c ? 'ring-2 ring-offset-1 ring-gray-400' : ''}`}></button>))}</div>
                                        <button onClick={saveEdit} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1"><SaveIcon /> Uložit</button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className={`absolute -left-[27px] top-1 w-3.5 h-3.5 ${event.color || 'bg-blue-500'} rounded-full border-2 border-white shadow-sm ring-1 ring-gray-50`}></div>
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1 mr-2 min-w-0">
                                            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded mb-1 inline-block border border-blue-100">{event.time}</span>
                                            
                                            <p className="text-gray-900 font-bold text-base leading-tight truncate">{event.title}</p>
                                            
                                            {/* ZMĚNA: Odkaz se zobrazí JEN POKUD je zadané místo */}
                                            {event.location && (
                                                <div className="flex items-center gap-1 mt-1 text-gray-400 group/link cursor-pointer hover:text-blue-600 transition-colors" onClick={() => window.open(getGoogleMapsLink(event.location!), '_blank')}>
                                                    <PinIcon />
                                                    <span className="text-xs font-medium truncate">{event.location}</span>
                                                    <ExternalLinkIcon />
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="flex gap-1 items-center bg-white border border-gray-100 rounded-lg p-1 shadow-sm opacity-80">
                                            {/* ZMĚNA: Tlačítko mapy je aktivní jen pokud je místo. Jinak je šedé a neklikatelné. */}
                                            {event.location ? (
                                                <a href={getGoogleMapsLink(event.location)} target="_blank" rel="noreferrer" className="w-8 h-8 flex items-center justify-center text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition" title="Navigovat">
                                                    <MapIcon />
                                                </a>
                                            ) : (
                                                <div className="w-8 h-8 flex items-center justify-center text-gray-200 cursor-not-allowed" title="Není zadáno místo">
                                                    <MapIcon />
                                                </div>
                                            )}
                                            
                                            <button onClick={() => startEditing(event)} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-md transition" title="Upravit">
                                                <EditIcon />
                                            </button>
                                            <button onClick={() => onDeleteEvent(event.id)} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition" title="Smazat">
                                                <TrashIcon />
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        ))}

        {isAdding && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsAdding(false)}></div>
                <div className="bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl relative z-10 animate-in zoom-in duration-200">
                    <button onClick={() => setIsAdding(false)} className="absolute top-4 right-4 p-2 bg-gray-50 rounded-full hover:bg-gray-100 text-gray-500"><XIcon /></button>
                    <h2 className="text-xl font-bold text-slate-900 mb-6 text-center">Nový bod plánu</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1 ml-1 uppercase tracking-wider">Co podniknem?</label>
                            <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Např. Večeře u moře" className={inputStyle} autoFocus required />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1 ml-1 uppercase tracking-wider">Kde to je?</label>
                            <div className="relative">
                                <span className="absolute left-3 top-3.5 text-gray-400"><PinIcon /></span>
                                <input type="text" value={newLocation} onChange={e => setNewLocation(e.target.value)} placeholder="Název místa nebo adresa" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-10 pr-4 py-3 font-medium text-slate-900 focus:outline-none focus:border-indigo-500 transition-all placeholder-slate-400" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1 ml-1 uppercase tracking-wider">Kdy</label>
                                <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} className={`${inputStyle} text-sm`} required />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1 ml-1 uppercase tracking-wider">Čas</label>
                                <input type="time" value={newTime} onChange={e => setNewTime(e.target.value)} className={`${inputStyle} text-sm`} required />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-2 ml-1 uppercase tracking-wider">Barva značky</label>
                            <div className="flex gap-2 justify-center bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                {DOT_COLORS.map(c => (
                                    <button key={c} type="button" onClick={() => setNewColor(c)} className={`w-6 h-6 rounded-full ${c} ${newColor === c ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : 'opacity-70 hover:opacity-100'} transition-all`}></button>
                                ))}
                            </div>
                        </div>
                        <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-lg shadow-xl hover:bg-slate-800 hover:scale-[1.02] active:scale-95 transition-all mt-2">Přidat do plánu</button>
                    </form>
                </div>
            </div>
        )}

        <button onClick={() => setIsAdding(true)} className="fixed bottom-8 right-6 w-16 h-16 bg-slate-900 text-white rounded-full shadow-2xl flex items-center justify-center text-3xl active:scale-90 transition z-40 hover:bg-slate-800 border-2 border-white">
            <PlusIcon />
        </button>
    </div>
  );
}