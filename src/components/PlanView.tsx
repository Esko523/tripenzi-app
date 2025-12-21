"use client";

import React, { useState, useMemo } from 'react';

// --- IKONY ---
const MapIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" x2="9" y1="3" y2="18"/><line x1="15" x2="15" y1="6" y2="21"/></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>;

type Event = { id: number; time: string; title: string; date?: string; color?: string; };
type Trip = { mapLink?: string; start_date?: string; }; // Stačí nám jen mapLink a start_date

interface PlanProps {
  events: Event[];
  trip: Trip;
  onAddEvent: (event: { title: string; time: string; date: string; color: string }) => void;
  onDeleteEvent: (id: number) => void;
}

const DOT_COLORS = ["bg-blue-500", "bg-red-500", "bg-green-500", "bg-yellow-500", "bg-purple-500", "bg-slate-500"];

export default function PlanView({ events, trip, onAddEvent, onDeleteEvent }: PlanProps) {
  // Lokální stavy formuláře (už nezatěžují hlavní stránku)
  const [newTitle, setNewTitle] = useState("");
  const [newTime, setNewTime] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newColor, setNewColor] = useState("bg-blue-500");

  // Nastavení výchozího data při načtení
  React.useEffect(() => {
      const today = new Date().toISOString().split('T')[0];
      setNewDate(trip.start_date || today);
  }, [trip.start_date]);

  // Seskupování eventů podle data
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
      onAddEvent({ title: newTitle, time: newTime, date: newDate || 'Neurčeno', color: newColor });
      setNewTitle("");
      setNewTime("");
  };

  return (
    <div className="space-y-6 pb-24">
        {trip.mapLink && (
            <a href={trip.mapLink} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 w-full py-3 bg-blue-50 text-blue-700 rounded-xl font-bold border border-blue-100 mb-6 hover:bg-blue-100 transition">
                <MapIcon /> Otevřít mapu trasy
            </a>
        )}
        
        {events.length === 0 && <p className="text-gray-400 text-sm italic text-center mt-10">Zatím žádný plán.</p>}
      
        {sortedDates.map(date => (
            <div key={date} className="relative">
                <div className="sticky top-0 bg-white/95 backdrop-blur py-2 z-10 border-b border-gray-50 mb-3">
                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
                        📅 {date === 'Neurčeno' ? 'Ostatní' : new Date(date).toLocaleDateString('cs-CZ', { weekday: 'short', day: 'numeric', month: 'long' })}
                    </h3>
                </div>
                <div className="space-y-0 border-l-2 border-gray-100 ml-2 pl-4 relative">
                    {groupedEvents[date].map((event) => (
                        <div key={event.id} className="relative group pb-6 last:pb-0">
                            <div className={`absolute -left-[21px] top-1 w-3 h-3 ${event.color || 'bg-blue-500'} rounded-full border-2 border-white shadow-sm`}></div>
                            <div className="flex justify-between items-start">
                                <div>
                                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded mb-1 inline-block">{event.time}</span>
                                    <p className="text-gray-900 font-medium">{event.title}</p>
                                </div>
                                <button onClick={() => onDeleteEvent(event.id)} className="text-gray-300 hover:text-red-500 opacity-100">
                                    <TrashIcon />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        ))}

        {/* Formulář dole */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 max-w-md mx-auto z-20">
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <div className="flex gap-2">
                    <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} className="bg-gray-100 rounded-xl px-3 py-3 font-bold text-xs focus:outline-blue-500 w-1/3" required />
                    <input type="time" value={newTime} onChange={e => setNewTime(e.target.value)} className="bg-gray-100 rounded-xl px-3 py-3 font-bold text-xs focus:outline-blue-500 w-1/4" required />
                    
                    {/* Výběr barvy */}
                    <div className="flex gap-1 items-center bg-gray-100 rounded-xl px-2 flex-1 justify-center">
                        {DOT_COLORS.map(c => (
                            <button key={c} type="button" onClick={() => setNewColor(c)} className={`w-4 h-4 rounded-full ${c} ${newColor === c ? 'ring-2 ring-offset-1 ring-gray-400' : ''}`}></button>
                        ))}
                    </div>
                </div>
                <div className="flex gap-2">
                    <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Co podniknem?" className="bg-gray-100 rounded-xl px-4 py-3 flex-1 text-sm focus:outline-blue-500" required />
                    <button type="submit" className="bg-blue-600 text-white w-12 rounded-xl flex items-center justify-center hover:bg-blue-700 shadow-lg font-bold text-xl">+</button>
                </div>
            </form>
        </div>
    </div>
  );
}