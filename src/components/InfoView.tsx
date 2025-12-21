"use client";

import React, { useState, useEffect } from 'react';

// --- IKONY ---
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const PhotoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>;

type Participant = { id: number; name: string; };
type Trip = { notes?: string; photoLink?: string; };

interface InfoProps {
  trip: Trip;
  participants: Participant[];
  onAddParticipant: (name: string) => void;
  onDeleteParticipant: (id: number) => void;
  onSaveDetails: (notes: string, photoLink: string) => void;
}

export default function InfoView({ trip, participants, onAddParticipant, onDeleteParticipant, onSaveDetails }: InfoProps) {
  const [newParticipant, setNewParticipant] = useState("");
  const [notes, setNotes] = useState(trip.notes || "");
  const [photoLink, setPhotoLink] = useState(trip.photoLink || "");

  // Synchronizace při načtení dat
  useEffect(() => {
      setNotes(trip.notes || "");
      setPhotoLink(trip.photoLink || "");
  }, [trip]);

  const handleAddPart = (e: React.FormEvent) => {
      e.preventDefault();
      if(newParticipant) {
          onAddParticipant(newParticipant);
          setNewParticipant("");
      }
  };

  // Ukládání detailů při opuštění pole (onBlur) nebo kliknutí
  const handleSave = () => onSaveDetails(notes, photoLink);

  return (
    <div className="space-y-6">
        {/* ÚČASTNÍCI */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><UsersIcon /> Účastníci</h3>
            <div className="flex flex-wrap gap-2 mb-4">
                {(participants || []).length === 0 && <p className="text-gray-400 text-sm italic w-full">Zatím nikdo připsaný.</p>}
                {participants?.map((participant) => (
                <div key={participant.id} className="bg-blue-50 text-blue-800 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2 border border-blue-100">
                    {participant.name} <button onClick={() => onDeleteParticipant(participant.id)} className="text-blue-300 hover:text-red-500 text-xs font-bold">×</button>
                </div>
                ))}
            </div>
            <form onSubmit={handleAddPart} className="flex gap-2">
                <input type="text" value={newParticipant} onChange={(e) => setNewParticipant(e.target.value)} placeholder="Přidat jméno..." className="bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm flex-1 focus:outline-blue-500" />
                <button type="submit" className="bg-blue-600 text-white px-4 rounded-lg text-sm font-bold hover:bg-blue-700">+</button>
            </form>
        </div>

        {/* FOTKY */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><PhotoIcon /> Sdílené fotky</h3>
            <div className="flex gap-2">
                <input type="text" value={photoLink} onChange={(e) => setPhotoLink(e.target.value)} placeholder="Vlož odkaz na Google Photos..." className="bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm flex-1 focus:outline-blue-500" />
                <button onClick={handleSave} className="bg-blue-600 text-white px-4 rounded-lg text-sm font-bold hover:bg-blue-700">Uložit</button>
            </div>
            {photoLink && (
                <div className="mt-2">
                    <a href={photoLink} target="_blank" rel="noreferrer" className="block bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 rounded-xl text-center font-bold shadow-md hover:opacity-90 transition">📸 Otevřít Galerii</a>
                </div>
            )}
        </div>

        {/* POZNÁMKY */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 shadow-sm">
            <h3 className="font-bold text-yellow-800 mb-2">📝 Důležité poznámky</h3>
            <textarea 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)} 
                onBlur={handleSave} // Uloží se, když klikneš jinam
                placeholder="Zde si napiš kód od wifi, adresu..." 
                className="w-full bg-transparent text-sm text-gray-800 placeholder-gray-400 focus:outline-none h-40 resize-none" 
            />
            <p className="text-[10px] text-yellow-600 mt-1 text-right">Ukládá se automaticky po dopsání</p>
        </div>
    </div>
  );
}