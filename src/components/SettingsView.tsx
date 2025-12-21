"use client";

import React, { useState, useEffect } from 'react';

// --- IKONY ---
const Share2Icon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/></svg>;
const CheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>;

const GRADIENTS = [
  "from-blue-500 to-cyan-400", "from-purple-500 to-indigo-500", "from-green-400 to-emerald-500",
  "from-yellow-400 to-orange-500", "from-pink-500 to-rose-500", "from-gray-700 to-black",
];
const CURRENCIES = ["CZK", "EUR", "USD", "PLN", "HRK", "GBP", "VND", "IDR", "HUF", "THB"];

type Trip = { 
  id: number; name: string; color: string; 
  startDate?: string; endDate?: string; // Změna: skutečná data
  budget: number; spent: number; coverImage?: string;
  baseCurrency?: string; totalBudget?: number; shareCode?: string; mapLink?: string;
};

interface SettingsProps {
  trip: Trip;
  onUpdate: (data: any) => void;
  onDelete: () => void;
  onColorChange: (color: string) => void;
}

export default function SettingsView({ trip, onUpdate, onDelete, onColorChange }: SettingsProps) {
  const [editName, setEditName] = useState(trip.name);
  const [editStartDate, setEditStartDate] = useState(trip.startDate || "");
  const [editEndDate, setEditEndDate] = useState(trip.endDate || "");
  const [editCurrency, setEditCurrency] = useState(trip.baseCurrency || "CZK");
  const [editBudget, setEditBudget] = useState(trip.totalBudget?.toString() || "");
  const [editMapLink, setEditMapLink] = useState(trip.mapLink || "");
  const [editImage, setEditImage] = useState(trip.coverImage || "");

  useEffect(() => {
    setEditName(trip.name);
    setEditStartDate(trip.startDate || "");
    setEditEndDate(trip.endDate || "");
    setEditCurrency(trip.baseCurrency || "CZK");
    setEditBudget(trip.totalBudget?.toString() || "");
    setEditMapLink(trip.mapLink || "");
    setEditImage(trip.coverImage || "");
  }, [trip]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({
        name: editName,
        start_date: editStartDate, // Ukládáme do nových sloupců
        end_date: editEndDate,
        base_currency: editCurrency,
        total_budget: editBudget ? Number(editBudget) : 0,
        map_link: editMapLink,
        cover_image: editImage
    });
  };

  const copyShareCode = () => {
      if(trip.shareCode) {
          const url = `https://tripenzi.netlify.app/trip/${trip.shareCode}`;
          navigator.clipboard.writeText(url);
          alert("Odkaz zkopírován: " + url);
      }
  };

  const shareUrl = `https://tripenzi.netlify.app/trip/${trip.shareCode}`;
  const inputStyle = "w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 font-medium text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder-slate-400";

  return (
    <div className="space-y-6 pb-10">
      <div className="bg-blue-50 p-6 rounded-[2rem] border border-blue-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-blue-100 rounded-full blur-2xl opacity-50"></div>
          <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2 relative z-10"><Share2Icon /> Sdílení tripu</h3>
          <div className="bg-white p-4 rounded-2xl flex justify-between items-center border border-blue-200 shadow-sm relative z-10">
              <span className="font-mono text-xl font-bold tracking-widest text-blue-600">{trip.shareCode}</span>
              <button onClick={copyShareCode} className="text-xs bg-blue-50 text-blue-700 px-4 py-2 rounded-xl font-bold hover:bg-blue-100 transition">Kopírovat</button>
          </div>
          <p className="text-[10px] text-blue-600/80 mt-3 font-medium text-center">Tento odkaz pošli kamarádům. Připojí se přímo.</p>
          <div className="mt-6 flex justify-center relative z-10">
              <div className="bg-white p-2 rounded-2xl shadow-md border border-blue-100">
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(shareUrl)}`} alt="QR Code" className="rounded-xl" />
              </div>
          </div>
      </div>

      <h2 className="text-xl font-bold text-slate-900 px-2">Upravit Trip</h2>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
            <label className="block text-xs font-bold text-slate-400 mb-1 ml-1 uppercase tracking-wider">Název cesty</label>
            <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className={inputStyle} />
        </div>
        
        {/* ZMĚNA: Dva inputy pro datum */}
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-xs font-bold text-slate-400 mb-1 ml-1 uppercase tracking-wider">Od</label>
                <input type="date" value={editStartDate} onChange={(e) => setEditStartDate(e.target.value)} className={`${inputStyle} text-sm`} />
            </div>
            <div>
                <label className="block text-xs font-bold text-slate-400 mb-1 ml-1 uppercase tracking-wider">Do</label>
                <input type="date" value={editEndDate} onChange={(e) => setEditEndDate(e.target.value)} className={`${inputStyle} text-sm`} />
            </div>
        </div>
        
        <div>
            <label className="block text-xs font-bold text-slate-400 mb-1 ml-1 uppercase tracking-wider">Celkový rozpočet</label>
            <input type="number" value={editBudget} onChange={(e) => setEditBudget(e.target.value)} placeholder="0" className={inputStyle} />
        </div>
        
        <div>
            <label className="block text-xs font-bold text-slate-400 mb-1 ml-1 uppercase tracking-wider">Odkaz na mapu</label>
            <input type="text" value={editMapLink} onChange={(e) => setEditMapLink(e.target.value)} placeholder="https://mapy.cz/..." className={inputStyle} />
        </div>
        
        <div>
            <label className="block text-xs font-bold text-slate-400 mb-1 ml-1 uppercase tracking-wider">Hlavní měna</label>
            <div className="flex flex-wrap gap-2">
                {CURRENCIES.map(c => (
                    <button type="button" key={c} onClick={() => setEditCurrency(c)} className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition ${editCurrency === c ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-100 hover:border-slate-200'}`}>{c}</button>
                ))}
            </div>
        </div>
        
        <div>
            <label className="block text-xs font-bold text-slate-400 mb-1 ml-1 uppercase tracking-wider">Obrázek pozadí (URL)</label>
            <input type="text" value={editImage} onChange={(e) => setEditImage(e.target.value)} placeholder="https://..." className={inputStyle} />
        </div>
        
        <div className="pt-2">
            <label className="block text-xs font-bold text-slate-400 mb-3 ml-1 uppercase tracking-wider">Nebo vyber barvu</label>
            <div className="grid grid-cols-3 gap-3">
                {GRADIENTS.map((gradient) => (
                    <button key={gradient} type="button" onClick={() => onColorChange(gradient)} className={`h-14 rounded-2xl bg-gradient-to-r ${gradient} flex items-center justify-center transform transition active:scale-95 hover:shadow-lg ${trip.color === gradient && !editImage ? 'ring-4 ring-offset-2 ring-indigo-100 scale-105' : ''}`}>
                        {trip.color === gradient && !editImage && <div className="text-white drop-shadow-md"><CheckIcon /></div>}
                    </button>
                ))}
            </div>
        </div>
        
        <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-lg shadow-xl shadow-slate-200 hover:bg-slate-800 hover:scale-[1.02] active:scale-95 transition-all mt-4">ULOŽIT ZMĚNY</button>
      </form>
      
      <button onClick={onDelete} className="w-full py-4 bg-white border-2 border-rose-100 text-rose-500 rounded-2xl font-bold text-lg mt-8 hover:bg-rose-50 hover:border-rose-200 transition active:scale-95 flex items-center justify-center gap-2">
          <TrashIcon /> SMAZAT TRIP
      </button>
    </div>
  );
}