"use client";

import React, { useState, useEffect, useMemo } from 'react';

// IKONY
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>;
const BackIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>;
const CheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const BackspaceIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 5H9l-7 7 7 7h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Z"/><line x1="18" x2="12" y1="9" y2="15"/><line x1="12" x2="18" y1="9" y2="15"/></svg>;
const ChartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>;
const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>;
const FilterIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>;
const ChevronDown = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>;
const RefreshIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>;
const ShareIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" x2="12" y1="2" y2="15"/></svg>;

const FoodIcon = () => <span>🍔</span>;
const DrinkIcon = () => <span>🍺</span>;
const TransportIcon = () => <span>🚕</span>;
const BedIcon = () => <span>🛏️</span>;
const TicketIcon = () => <span>🎫</span>;
const ShopIcon = () => <span>🛒</span>;
const SettleIcon = () => <span>🤝</span>;

type SplitMethod = 'equal' | 'exact' | 'shares';
type Expense = { 
  id: number; title: string; amount: number; currency: string; exchangeRate: number; payer: string; 
  category?: string; splitMethod?: SplitMethod; splitDetails?: Record<string, number>; forWhom?: string[]; isSettlement?: boolean;
};
type Participant = { id: number; name: string; };

interface BudgetProps {
  expenses: Expense[];
  participants: Participant[];
  baseCurrency: string;
  totalBudget: number;
  onAddExpense: (expense: Omit<Expense, "id">) => void;
  onDeleteExpense: (id: number) => void;
}

const CATEGORIES = [
  { id: 'food', icon: <FoodIcon />, label: 'Jídlo' },
  { id: 'drink', icon: <DrinkIcon />, label: 'Pití' },
  { id: 'transport', icon: <TransportIcon />, label: 'Doprava' },
  { id: 'accom', icon: <BedIcon />, label: 'Spaní' },
  { id: 'fun', icon: <TicketIcon />, label: 'Zábava' },
  { id: 'other', icon: <ShopIcon />, label: 'Nákupy' },
];

const CURRENCIES = ["CZK", "EUR", "USD", "PLN", "HRK", "GBP", "VND", "IDR", "HUF", "THB"];

export default function BudgetView({ expenses = [], participants = [], baseCurrency, totalBudget, onAddExpense, onDeleteExpense }: BudgetProps) {
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [viewMode, setViewMode] = useState<'list' | 'stats'>('list');
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [filterPerson, setFilterPerson] = useState<string | null>(null);
  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);
  const [liveRates, setLiveRates] = useState<Record<string, number>>({});
  const [ratesLoading, setRatesLoading] = useState(false);

  const [displayValue, setDisplayValue] = useState("0");
  const [currency, setCurrency] = useState(baseCurrency);
  const [exchangeRate, setExchangeRate] = useState(1);
  const [title, setTitle] = useState("");
  const [payer, setPayer] = useState(""); 
  const [category, setCategory] = useState("food");
  const [splitMethod, setSplitMethod] = useState<SplitMethod>('equal');
  const [splitValues, setSplitValues] = useState<Record<string, number>>({});
  const [selectedEqual, setSelectedEqual] = useState<string[]>([]);
  const [isSettlement, setIsSettlement] = useState(false);
  const [settleReceiver, setSettleReceiver] = useState("");

  const activeParticipants = participants.length > 0 ? participants.map(p => p.name) : ["Já"];

  useEffect(() => {
    setSelectedEqual(activeParticipants);
    const initialShares: Record<string, number> = {};
    activeParticipants.forEach(p => initialShares[p] = 1);
    setSplitValues(initialShares);
  }, [participants]);

  useEffect(() => {
    const fetchRates = async () => {
        setRatesLoading(true);
        try {
            const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${baseCurrency}`);
            const data = await response.json();
            setLiveRates(data.rates);
        } catch (error) { console.error("Chyba kurzů", error); } finally { setRatesLoading(false); }
    };
    fetchRates();
  }, [baseCurrency]);

  useEffect(() => {
    if (currency === baseCurrency) { setExchangeRate(1); } 
    else if (liveRates[currency]) { setExchangeRate(Number((1 / liveRates[currency]).toFixed(4))); }
  }, [currency, baseCurrency, liveRates]);

  const safeExpenses = Array.isArray(expenses) ? expenses : [];

  const { calculatedTotal, balances, debts, statsByCategory, statsByPerson } = useMemo(() => {
    let sumTotal = 0;
    const bals: Record<string, number> = {}; 
    const cats: Record<string, number> = {};
    const pers: Record<string, number> = {};
    
    activeParticipants.forEach(p => { bals[p] = 0; pers[p] = 0; });

    safeExpenses.forEach(expense => {
      const rate = expense.exchangeRate || 1;
      const amountInBase = expense.amount * rate;

      if (!expense.isSettlement) {
        sumTotal += amountInBase;
        const cat = expense.category || 'other';
        cats[cat] = (cats[cat] || 0) + amountInBase;
      }

      const payerName = activeParticipants.includes(expense.payer) ? expense.payer : null;
      if (payerName) bals[payerName] += amountInBase;

      const method = expense.splitMethod || 'equal';
      if (method === 'equal') {
        let targets = expense.forWhom || (expense.splitDetails ? Object.keys(expense.splitDetails) : []);
        if (!Array.isArray(targets)) targets = [];
        
        const validTargets = targets.filter(t => activeParticipants.includes(t));
        const finalTargets = validTargets.length > 0 ? validTargets : activeParticipants;
        const share = amountInBase / finalTargets.length;
        
        finalTargets.forEach(person => { 
            bals[person] -= share; 
            if(!expense.isSettlement) pers[person] += share; 
        });
      } else if (method === 'exact') {
        Object.entries(expense.splitDetails || {}).forEach(([person, val]) => { 
            if (activeParticipants.includes(person)) {
                const valInBase = val * rate;
                bals[person] -= valInBase;
                if(!expense.isSettlement) pers[person] += valInBase;
            }
        });
      } else if (method === 'shares') {
        const details = expense.splitDetails || {};
        const totalShares = Object.values(details).reduce((sum, val) => sum + val, 0);
        if (totalShares > 0) {
            Object.entries(details).forEach(([person, weight]) => {
                if (activeParticipants.includes(person)) {
                    const share = (amountInBase * weight) / totalShares;
                    bals[person] -= share;
                    if(!expense.isSettlement) pers[person] += share;
                }
            });
        }
      }
    });

    let debtors = Object.entries(bals).filter(([, b]) => b < -0.1).sort(([, a], [, b]) => a - b);
    let creditors = Object.entries(bals).filter(([, b]) => b > 0.1).sort(([, a], [, b]) => b - a);
    const transactions = [];
    let i = 0; let j = 0;
    while (i < debtors.length && j < creditors.length) {
        const debtor = debtors[i];
        const creditor = creditors[j];
        const amount = Math.min(Math.abs(debtor[1]), creditor[1]);
        transactions.push({ from: debtor[0], to: creditor[0], amount: amount });
        debtor[1] += amount;
        creditor[1] -= amount;
        if (Math.abs(debtor[1]) < 0.1) i++;
        if (creditor[1] < 0.1) j++;
    }

    return { calculatedTotal: sumTotal, balances: bals, debts: transactions, statsByCategory: cats, statsByPerson: pers };
  }, [safeExpenses, activeParticipants, baseCurrency]);

  const handleExport = () => {
      let text = `🌍 Vyúčtování (${baseCurrency})\nCelkem: ${Math.round(calculatedTotal)}\n\n`;
      if (debts.length === 0) text += "Vyrovnáno! ✅";
      else debts.forEach(d => text += `${d.from} ➡️ ${d.to}: ${Math.round(d.amount)} ${baseCurrency}\n`);
      navigator.clipboard.writeText(text).then(() => alert("Zkopírováno! 📋"));
  };

  const handleCalcInput = (val: string) => {
    if (val === 'C') setDisplayValue("0");
    else if (val === 'back') setDisplayValue(prev => prev.length > 1 ? prev.slice(0, -1) : "0");
    else if (['+', '-', '*', '/'].includes(val)) setDisplayValue(prev => prev + val);
    else setDisplayValue(prev => prev === "0" && val !== '.' ? val : prev + val);
  };

  const calculateResult = () => {
    try {
        const result = new Function('return ' + displayValue)(); 
        return Number(result) || 0;
    } catch { return 0; }
  };

  const handleEqual = () => setDisplayValue(String(calculateResult()));

  const goToStep2 = () => {
    const res = calculateResult();
    if (res <= 0) return;
    setDisplayValue(String(res));
    setStep(2);
  };

  const openSettleUp = (from: string, to: string, amount: number) => {
      setTitle(`Splátka pro ${to}`);
      setDisplayValue(String(Math.round(amount))); 
      setCurrency(baseCurrency);
      setExchangeRate(1);
      setPayer(from);
      setIsSettlement(true);
      setSettleReceiver(to);
      setIsWizardOpen(true);
      setStep(1); 
  };

  const handleSubmit = () => {
    const finalAmount = calculateResult();
    if (splitMethod === 'exact' && Math.abs(finalAmount - Object.values(splitValues).reduce((a,b)=>a+(Number(b)||0),0)) > 0.1) {
        alert("Částky nesedí s celkovou sumou!");
        return;
    }
    if (!title) { alert("Vyplň název!"); return; }
    
    const finalPayer = payer || activeParticipants[0];
    let finalSplitDetails: Record<string, number> = {};

    if (isSettlement) {
        activeParticipants.forEach(p => finalSplitDetails[p] = 0);
        finalSplitDetails[settleReceiver] = finalAmount;
    } else {
        if (splitMethod === 'equal') selectedEqual.forEach(p => finalSplitDetails[p] = 1);
        else finalSplitDetails = { ...splitValues };
    }

    onAddExpense({
        title: isSettlement ? "Vyrovnání dluhu" : title,
        amount: finalAmount,
        currency,
        exchangeRate,
        payer: finalPayer,
        category: isSettlement ? 'settlement' : category,
        splitMethod: isSettlement ? 'exact' : splitMethod,
        splitDetails: finalSplitDetails,
        isSettlement
    });
    
    setIsWizardOpen(false);
    setIsSettlement(false);
    setStep(1);
    setDisplayValue("0");
    setTitle("");
    setCurrency(baseCurrency);
    setSplitValues(activeParticipants.reduce((acc, p) => ({...acc, [p]: 0}), {}));
  };

  const handleFilterPerson = (name: string) => {
      if (filterPerson === name) setFilterPerson(null);
      else setFilterPerson(name);
  };

  const filteredExpenses = safeExpenses.slice().reverse().filter(e => {
      if (!filterPerson) return true;
      if (e.payer === filterPerson) return true;
      const method = e.splitMethod || 'equal';
      if (method === 'equal') {
          const targets = e.forWhom || (e.splitDetails && Object.keys(e.splitDetails)) || [];
          return targets.includes(filterPerson);
      } else {
          return (e.splitDetails?.[filterPerson] || 0) > 0;
      }
  });

  return (
    <div className="pb-24">
      {!isWizardOpen && !selectedExpense && (
        <>
            <div className="flex justify-center items-center mb-4 relative">
                <div className="bg-gray-100 p-1 rounded-xl flex">
                    <button onClick={() => setViewMode('list')} className={`px-4 py-1 text-xs font-bold rounded-lg transition ${viewMode==='list' ? 'bg-white shadow text-black' : 'text-gray-400'}`}>Přehled</button>
                    <button onClick={() => setViewMode('stats')} className={`px-4 py-1 text-xs font-bold rounded-lg transition ${viewMode==='stats' ? 'bg-white shadow text-black' : 'text-gray-400'}`}>Grafy</button>
                </div>
                <button onClick={handleExport} className="absolute right-0 text-blue-600 p-2 rounded-full hover:bg-blue-50"><ShareIcon /></button>
            </div>

            {viewMode === 'list' ? (
                <>
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 mb-6 text-center relative overflow-hidden">
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1 relative z-10">Celková útrata</p>
                        <h2 className="text-4xl font-black text-gray-900 relative z-10">{Math.round(calculatedTotal).toLocaleString()} {baseCurrency}</h2>
                        {totalBudget > 0 && (
                            <div className="mt-2 relative z-10">
                                <div className="text-xs font-bold text-gray-400 mb-1">z rozpočtu {totalBudget.toLocaleString()} {baseCurrency}</div>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden w-full max-w-[200px] mx-auto">
                                    <div className={`h-full rounded-full ${calculatedTotal > totalBudget ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${Math.min((calculatedTotal / totalBudget) * 100, 100)}%` }}></div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mb-6">
                        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 px-2">
                            {activeParticipants.map(name => {
                                const bal = balances[name] || 0;
                                const isZero = Math.abs(bal) < 1;
                                const isPlus = bal >= 1;
                                return (
                                    <button key={name} onClick={() => handleFilterPerson(name)} className={`flex flex-col items-center min-w-[70px] p-2 rounded-xl border transition ${filterPerson === name ? 'bg-gray-100 border-gray-400' : 'bg-white border-gray-100'}`}>
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold mb-1 ${filterPerson === name ? 'bg-black text-white' : 'bg-gray-100 text-gray-600'}`}>{name.charAt(0)}</div>
                                        <span className="text-[10px] font-bold text-gray-900">{name}</span>
                                        <span className={`text-[10px] font-bold ${isZero ? 'text-black' : isPlus ? 'text-green-600' : 'text-red-500'}`}>
                                            {isZero ? '0' : (isPlus ? '+' : '') + Math.round(bal)}
                                        </span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {debts.length > 0 && !filterPerson && (
                        <div className="mb-8">
                            <h3 className="font-bold text-gray-800 mb-3 px-2">🤝 Kdo komu dluží</h3>
                            <div className="space-y-2">
                                {debts.map((t, idx) => (
                                    Math.round(t.amount) > 0 && (
                                    <div key={idx} className="bg-white p-3 rounded-xl border border-gray-200 flex justify-between items-center shadow-sm">
                                        <div className="flex items-center gap-2 text-sm text-gray-700">
                                            <span className="font-bold">{t.from}</span> <span className="text-gray-400">→</span> <span className="font-bold">{t.to}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-blue-600">{Math.round(t.amount)} {baseCurrency}</span>
                                            <button onClick={() => openSettleUp(t.from, t.to, t.amount)} className="text-[10px] bg-blue-600 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-blue-700 shadow-md active:scale-95">Splatit</button>
                                        </div>
                                    </div>
                                    )
                                ))}
                            </div>
                        </div>
                    )}

                    <h3 className="font-bold text-gray-800 mb-3 px-2 flex justify-between items-center">
                        <span>💸 Historie {filterPerson && `(${filterPerson})`}</span>
                        {filterPerson && <button onClick={() => setFilterPerson(null)} className="text-xs text-blue-600 font-bold flex items-center gap-1"><FilterIcon /> Zrušit filtr</button>}
                    </h3>
                    <div className="space-y-3 pb-20">
                        {filteredExpenses.length === 0 && <p className="text-center text-gray-400 text-sm py-4">Žádné transakce.</p>}
                        {filteredExpenses.map((expense) => {
                        const CatIcon = expense.isSettlement ? <SettleIcon /> : (CATEGORIES.find(c => c.id === expense.category)?.icon || <ShopIcon />);
                        const isSettlement = expense.isSettlement;
                        return (
                            <div key={expense.id} onClick={() => setSelectedExpense(expense)} className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm flex justify-between items-center cursor-pointer active:scale-95 transition">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg border ${isSettlement ? 'bg-green-100 border-green-200' : 'bg-gray-50 border-gray-100'}`}>{CatIcon}</div>
                                    <div>
                                        <p className="font-bold text-gray-900">{expense.title}</p>
                                        <p className="text-[10px] text-gray-600 font-bold bg-gray-100 px-1.5 py-0.5 rounded w-fit border border-gray-200">
                                            {expense.payer} {isSettlement ? 'vyrovnal' : 'platil'} • {expense.currency !== baseCurrency && <span>{expense.amount} {expense.currency}</span>}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={`font-bold block ${isSettlement ? 'text-green-600' : 'text-gray-900'}`}>
                                        {isSettlement ? '' : '-'}{Math.round(expense.amount * (expense.exchangeRate || 1))} {baseCurrency}
                                    </span>
                                </div>
                            </div>
                        );
                        })}
                    </div>
                </>
            ) : (
                <div className="space-y-6">
                    <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><ChartIcon /> Spotřeba (kdo za kolik)</h3>
                        <div className="space-y-3">
                            {Object.entries(statsByPerson).sort(([,a], [,b]) => b-a).map(([name, amount]) => (
                                <div key={name}>
                                    <div className="flex justify-between text-xs font-bold mb-1"><span>{name}</span><span>{Math.round(amount)} {baseCurrency}</span></div>
                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${calculatedTotal > 0 ? (amount / calculatedTotal) * 100 : 0}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><ChartIcon /> Útrata podle kategorií</h3>
                        <div className="space-y-3">
                            {CATEGORIES.map(cat => {
                                const amount = statsByCategory[cat.id] || 0;
                                if (amount === 0) return null;
                                return (
                                    <div key={cat.id}>
                                        <div className="flex justify-between text-xs font-bold mb-1"><span className="flex items-center gap-1">{cat.icon} {cat.label}</span><span>{Math.round(amount)} {baseCurrency}</span></div>
                                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-orange-400 rounded-full" style={{ width: `${calculatedTotal > 0 ? (amount / calculatedTotal) * 100 : 0}%` }}></div></div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            )}

            <button onClick={() => { setIsWizardOpen(true); setIsSettlement(false); setStep(1); setDisplayValue("0"); setTitle(""); }} className="fixed bottom-24 right-6 w-16 h-16 bg-black text-white rounded-full shadow-2xl flex items-center justify-center text-3xl active:scale-90 transition z-40 hover:bg-gray-800 border-2 border-white">
                <span className="mb-1">+</span>
            </button>
        </>
      )}

      {selectedExpense && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setSelectedExpense(null)}>
              <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl relative animate-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
                  <button onClick={() => setSelectedExpense(null)} className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200"><XIcon /></button>
                  <h3 className="text-2xl font-bold mb-1">{selectedExpense.title}</h3>
                  <p className="text-gray-500 font-bold mb-6 text-xl">{selectedExpense.amount} {selectedExpense.currency}</p>
                  
                  <div className="space-y-4 text-sm">
                      <div className="flex justify-between border-b pb-2"><span className="text-gray-500">Platil</span><span className="font-bold">{selectedExpense.payer}</span></div>
                      {!selectedExpense.isSettlement && <div className="flex justify-between border-b pb-2"><span className="text-gray-500">Kategorie</span><span className="font-bold capitalize">{selectedExpense.category}</span></div>}
                      {selectedExpense.currency !== baseCurrency && (<div className="flex justify-between border-b pb-2"><span className="text-gray-500">Kurz</span><span className="font-bold">1 {selectedExpense.currency} = {selectedExpense.exchangeRate} {baseCurrency}</span></div>)}
                      <div>
                          <span className="text-gray-500 block mb-2">{selectedExpense.isSettlement ? 'Příjemce' : 'Rozdělení mezi'}</span>
                          <div className="bg-gray-50 p-3 rounded-xl space-y-1">
                             {selectedExpense.splitMethod === 'equal' ? (
                                <div className="flex flex-wrap gap-1">{(selectedExpense.forWhom || Object.keys(selectedExpense.splitDetails || {})).map(p => <span key={p} className="bg-white px-2 py-1 rounded border text-xs">{p}</span>)}</div>
                             ) : (
                                Object.entries(selectedExpense.splitDetails || {}).map(([name, val]) => (val > 0 && <div key={name} className="flex justify-between text-xs"><span>{name}</span><span className="font-bold">{val} {selectedExpense.splitMethod==='shares'?'podílů':selectedExpense.currency}</span></div>))
                             )}
                          </div>
                      </div>
                  </div>
                  <button onClick={() => { onDeleteExpense(selectedExpense.id); setSelectedExpense(null); }} className="w-full mt-6 py-3 border-2 border-red-100 text-red-600 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-red-50"><TrashIcon /> Smazat</button>
              </div>
          </div>
      )}

      {isWizardOpen && (
        <div className="fixed inset-0 bg-gray-100 z-50 flex flex-col animate-in slide-in-from-bottom duration-300">
            <div className="bg-white p-4 flex items-center justify-between shadow-sm border-b border-gray-200">
                <button onClick={() => { if(step===1) setIsWizardOpen(false); else setStep(1); }} className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-600"><BackIcon /></button>
                <span className="font-bold text-sm text-gray-700">{isSettlement ? 'Kolik splatit?' : (step === 1 ? 'Zadej částku' : 'Detaily')}</span>
                <div className="w-8"></div>
            </div>

            {step === 1 && (
                <div className="flex-1 flex flex-col">
                    <div className="flex-1 flex flex-col justify-end items-end p-6 bg-gray-50">
                        {!isSettlement && (
                            <div className="relative mb-4">
                                <button onClick={() => setIsCurrencyDropdownOpen(!isCurrencyDropdownOpen)} className="flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full border bg-white shadow-sm border-gray-200 text-gray-800">
                                    {currency} <ChevronDown />
                                    {ratesLoading && <span className="animate-spin"><RefreshIcon/></span>}
                                </button>
                                {isCurrencyDropdownOpen && (
                                    <div className="absolute top-8 right-0 bg-white border border-gray-200 shadow-xl rounded-xl p-2 grid grid-cols-2 gap-2 z-50 w-48">
                                        {CURRENCIES.map(curr => (
                                            <button key={curr} onClick={() => { setCurrency(curr); setIsCurrencyDropdownOpen(false); }} className={`px-2 py-1 rounded text-sm font-bold text-left hover:bg-gray-50 ${currency===curr ? 'text-blue-600' : 'text-gray-600'}`}>{curr}</button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                        <div className="text-6xl font-black text-gray-900 tracking-tighter break-all text-right w-full drop-shadow-sm">
                            {displayValue} <span className="text-2xl text-gray-400 font-medium">{currency}</span>
                        </div>
                    </div>
                    {/* OPRAVENÁ MŘÍŽKA KALKULAČKY 4x5 */}
                    <div className="bg-white p-3 pb-8 grid grid-cols-4 gap-3 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] border-t border-gray-200">
                        {['C', '/', '*', 'back', '7', '8', '9', '-', '4', '5', '6', '+'].map(btn => (
                            <button key={btn} onClick={() => handleCalcInput(btn)} className="aspect-square rounded-2xl bg-gray-50 hover:bg-gray-200 font-bold text-xl text-gray-700 border border-gray-100 flex items-center justify-center">
                                {btn === 'back' ? <BackspaceIcon /> : btn}
                            </button>
                        ))}
                        
                        {/* 4. Řádek */}
                        <button onClick={() => handleCalcInput('1')} className="aspect-square rounded-2xl bg-white hover:bg-gray-100 font-bold text-xl text-gray-700 border border-gray-100 flex items-center justify-center">1</button>
                        <button onClick={() => handleCalcInput('2')} className="aspect-square rounded-2xl bg-white hover:bg-gray-100 font-bold text-xl text-gray-700 border border-gray-100 flex items-center justify-center">2</button>
                        <button onClick={() => handleCalcInput('3')} className="aspect-square rounded-2xl bg-white hover:bg-gray-100 font-bold text-xl text-gray-700 border border-gray-100 flex items-center justify-center">3</button>
                        <button onClick={handleEqual} className="aspect-square rounded-2xl bg-orange-100 hover:bg-orange-200 text-orange-600 font-bold text-xl border border-orange-200 flex items-center justify-center">=</button>
                        
                        {/* 5. Řádek */}
                        <button onClick={() => handleCalcInput('0')} className="col-span-2 aspect-[2/1] rounded-2xl bg-white hover:bg-gray-100 font-bold text-xl text-gray-700 border border-gray-100 flex items-center justify-center">0</button>
                        <button onClick={() => handleCalcInput('.')} className="aspect-square rounded-2xl bg-white hover:bg-gray-100 font-bold text-xl text-gray-700 border border-gray-100 flex items-center justify-center">.</button>
                        <button onClick={isSettlement ? handleSubmit : goToStep2} className="aspect-square rounded-2xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-lg shadow-blue-200/50">
                            <CheckIcon />
                        </button>
                    </div>
                </div>
            )}
            
            {/* Krok 2 (Detaily) */}
            {step === 2 && !isSettlement && (
                <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50">
                    <div className="text-center bg-white p-6 rounded-3xl shadow-sm border border-gray-200">
                        <h2 className="text-4xl font-black text-gray-900">{displayValue} <span className="text-xl text-gray-400">{currency}</span></h2>
                        <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Za co to bylo?" autoFocus className="mt-4 text-center w-full text-xl font-bold border-b-2 border-gray-200 focus:border-black focus:outline-none py-2 bg-transparent placeholder-gray-300 text-gray-800" />
                        
                        {currency !== baseCurrency && (
                            <div className="mt-4 flex justify-center items-center gap-2 bg-blue-50 p-2 rounded-lg inline-flex">
                                <span className="text-xs font-bold text-blue-800">Kurz: 1 {currency} = </span>
                                <input type="number" value={exchangeRate} onChange={e => setExchangeRate(Number(e.target.value))} className="w-20 bg-white border border-blue-200 rounded px-2 py-1 text-center text-xs font-bold focus:outline-blue-500" />
                                <span className="text-xs font-bold text-blue-800">{baseCurrency}</span>
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-2 block ml-1">Kategorie</label>
                        <div className="flex justify-between gap-1">{CATEGORIES.map(cat => (<button key={cat.id} onClick={() => setCategory(cat.id)} className={`flex-1 h-12 rounded-xl flex items-center justify-center text-xl transition border-2 ${category === cat.id ? 'bg-blue-50 border-blue-500 scale-105 shadow-sm' : 'bg-white border-transparent text-gray-400 hover:bg-gray-100'}`}>{cat.icon}</button>))}</div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-2 block ml-1">Kdo platil?</label>
                        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">{activeParticipants.map(p => (<button key={p} onClick={() => setPayer(p)} className={`px-4 py-3 rounded-xl font-bold border-2 transition whitespace-nowrap shadow-sm ${payer === p || (!payer && p === activeParticipants[0]) ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-100'}`}>{p}</button>))}</div>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                        <div className="flex border-b border-gray-100">
                            <button onClick={() => setSplitMethod('equal')} className={`flex-1 py-3 text-xs font-bold ${splitMethod === 'equal' ? 'bg-blue-50 text-blue-700' : 'text-gray-400 hover:bg-gray-50'}`}>Rovným dílem</button>
                            <button onClick={() => setSplitMethod('exact')} className={`flex-1 py-3 text-xs font-bold ${splitMethod === 'exact' ? 'bg-blue-50 text-blue-700' : 'text-gray-400 hover:bg-gray-50'}`}>Přesně</button>
                            <button onClick={() => setSplitMethod('shares')} className={`flex-1 py-3 text-xs font-bold ${splitMethod === 'shares' ? 'bg-blue-50 text-blue-700' : 'text-gray-400 hover:bg-gray-50'}`}>Podíly</button>
                        </div>
                        <div className="p-4">
                            {splitMethod === 'equal' && (
                                <div className="flex flex-wrap gap-2">{activeParticipants.map(person => (<button key={person} onClick={() => setSelectedEqual(prev => prev.includes(person) ? prev.filter(p => p !== person) : [...prev, person])} className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${selectedEqual.includes(person) ? 'bg-white border-green-500 text-green-700 shadow-sm' : 'bg-transparent border-transparent text-gray-400'}`}>{person} {selectedEqual.includes(person) && "✓"}</button>))}</div>
                            )}
                            {splitMethod === 'exact' && (
                                <div className="space-y-2">
                                    {activeParticipants.map(person => (<div key={person} className="flex justify-between items-center text-xs"><span className="font-bold text-gray-700">{person}</span><div className="flex items-center gap-1"><input type="number" placeholder="0" value={splitValues[person] || ''} onChange={(e) => setSplitValues({...splitValues, [person]: Number(e.target.value)})} className="w-20 bg-gray-50 border border-gray-200 rounded px-2 py-1 text-right focus:outline-blue-500 font-bold" /><span className="text-gray-400">{currency}</span></div></div>))}
                                    <div className={`text-right text-xs font-bold mt-2 ${Math.abs(Number(displayValue) - Object.values(splitValues).reduce((a,b)=>a+(Number(b)||0),0)) < 0.1 ? 'text-green-600' : 'text-red-500'}`}>Zbývá: {Math.round((Number(displayValue) - Object.values(splitValues).reduce((a,b)=>a+(Number(b)||0),0))*100)/100} {currency}</div>
                                </div>
                            )}
                            {splitMethod === 'shares' && (
                                <div className="space-y-2">{activeParticipants.map(person => (<div key={person} className="flex justify-between items-center text-xs"><span className="font-bold text-gray-700">{person}</span><div className="flex items-center gap-2"><button onClick={() => setSplitValues({...splitValues, [person]: (splitValues[person]||0)-0.5})} className="w-8 h-8 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center font-bold text-gray-600 hover:bg-gray-200">-</button><span className="w-8 text-center font-bold text-lg">{splitValues[person] || 0}</span><button onClick={() => setSplitValues({...splitValues, [person]: (splitValues[person]||0)+0.5})} className="w-8 h-8 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center font-bold text-gray-600 hover:bg-gray-200">+</button></div></div>))}</div>
                            )}
                        </div>
                    </div>
                    <button onClick={handleSubmit} className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg shadow-xl active:scale-95 transition hover:bg-gray-900">ULOŽIT VÝDAJ</button>
                    <div className="h-10"></div>
                </div>
            )}
        </div>
      )}
    </div>
  );
}