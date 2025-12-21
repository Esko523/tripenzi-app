"use client";

import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Logo from '@/components/Logo';

// Definice typu User (musí být stejná jako v page.tsx)
type User = { id: number; custom_id: string; name: string; avatar?: string; };

interface LoginViewProps {
  onLogin: (user: User) => void;
}

export default function LoginView({ onLogin }: LoginViewProps) {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authInputName, setAuthInputName] = useState("");
  const [authInputID, setAuthInputID] = useState("");
  const [authError, setAuthError] = useState("");

  // Styly
  const inputStyle = "w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 font-medium text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder-slate-400";
  const btnPrimary = "w-full py-4 rounded-2xl font-bold text-lg shadow-xl shadow-slate-200 bg-slate-900 text-white hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2";
  const btnAction = "w-full py-3 rounded-xl font-bold bg-indigo-600 text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-transform flex items-center justify-center";
  const tabBtn = "flex-1 py-3 text-sm font-bold rounded-xl transition-all";
  const tabBtnActive = "bg-white shadow-sm text-slate-900";
  const tabBtnInactive = "text-slate-400 hover:text-slate-600";

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authInputName.trim()) return;
    const randomId = `#${Math.floor(1000 + Math.random() * 9000)}`;
    const { data } = await supabase.from('users').insert([{ custom_id: randomId, name: authInputName, avatar: "👤" }]).select().single();
    if (data) onLogin(data);
    else setAuthError("Chyba registrace.");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const searchID = authInputID.startsWith('#') ? authInputID : `#${authInputID}`;
    const { data } = await supabase.from('users').select('*').eq('custom_id', searchID).single();
    if (data) onLogin(data);
    else setAuthError("Uživatel nenalezen.");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 font-sans">
      <div className="w-full max-w-sm bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-indigo-100 border border-white">
        <div className="flex justify-center mb-8">
          <Logo size="xl" variant="badge" />
        </div>
        <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-8">
          <button onClick={() => setAuthMode('login')} className={`${tabBtn} ${authMode === 'login' ? tabBtnActive : tabBtnInactive}`}>Přihlásit</button>
          <button onClick={() => setAuthMode('register')} className={`${tabBtn} ${authMode === 'register' ? tabBtnActive : tabBtnInactive}`}>Registrovat</button>
        </div>
        
        {authMode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest pl-1">Tvoje ID</label>
              <input type="text" value={authInputID} onChange={(e) => setAuthInputID(e.target.value)} placeholder="#1234" className={`${inputStyle} text-center font-mono text-2xl tracking-widest uppercase`} autoFocus />
            </div>
            {authError && <p className="text-rose-500 text-xs text-center font-bold bg-rose-50 py-2 rounded-lg">{authError}</p>}
            <button type="submit" className={btnPrimary}>Vstoupit</button>
          </form>
        )}

        {authMode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest pl-1">Jak ti říkají?</label>
              <input type="text" value={authInputName} onChange={(e) => setAuthInputName(e.target.value)} placeholder="Např. Lukáš" className={inputStyle} autoFocus />
            </div>
            <button type="submit" className={btnAction}>Získat ID a vstoupit</button>
          </form>
        )}
      </div>
    </div>
  );
}