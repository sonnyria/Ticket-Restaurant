import React, { useState } from 'react';
import { Calendar, User, ShoppingCart, Send, Loader2 } from 'lucide-react';
import { SheetPayload, ActionType } from '../types';

interface TransactionFormProps {
  names: string[];
  loading: boolean;
  onTransaction: (payload: SheetPayload) => void;
  disabled: boolean;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({ names, loading, onTransaction, disabled }) => {
  // Initialisation à la date du jour (YYYY-MM-DD) pour l'input type="date"
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const defaultDate = `${year}-${month}-${day}`;

  const [dateStr, setDateStr] = useState(defaultDate);
  const [selectedName, setSelectedName] = useState('');
  const [quantity, setQuantity] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedName || !quantity || !dateStr) return;

    const [yearPart, monthPart, dayPart] = dateStr.split('-');
    const formattedDate = `${dayPart}/${monthPart}/${yearPart}`;

    onTransaction({
      action: ActionType.TRANSACTION,
      date: formattedDate,
      name: selectedName,
      quantity: Number(quantity)
    });

    setQuantity('');
    setSelectedName('');
  };

  const getFormattedDateDisplay = () => {
    if (!dateStr) return 'JJ/MM/AAAA';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-3xl shadow-xl shadow-red-100/50 border border-red-100 overflow-hidden">
        <div className="bg-gradient-to-r from-red-50 to-orange-50 px-6 py-5 border-b border-red-100">
          <h3 className="text-red-900 font-bold text-lg flex items-center gap-2">
            <span className="bg-white p-1.5 rounded-lg shadow-sm text-red-600"><ShoppingCart size={18} /></span>
            Distribution de Tickets
          </h3>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Date Input */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
              <Calendar size={14} className="text-red-400" /> Date
            </label>
            <input
              type="date"
              value={dateStr}
              onChange={(e) => setDateStr(e.target.value)}
              disabled={loading || disabled}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all font-medium focus:bg-white"
              required
            />
          </div>

          {/* Name Select */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
              <User size={14} className="text-red-400" /> Bénéficiaire
            </label>
            <div className="relative">
              <select
                value={selectedName}
                onChange={(e) => setSelectedName(e.target.value)}
                disabled={loading || disabled || names.length === 0}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all appearance-none font-medium focus:bg-white"
                required
              >
                <option value="" disabled>Sélectionner un nom</option>
                {names.length > 0 ? (
                  names.map((name, idx) => (
                    <option key={idx} value={name}>{name}</option>
                  ))
                ) : (
                  <option value="" disabled>Aucun nom trouvé</option>
                )}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>

          {/* Quantity Input */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
              <ShoppingCart size={14} className="text-red-400" /> Nombre de tickets
            </label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              disabled={loading || disabled}
              placeholder="Ex: 20"
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all font-medium focus:bg-white"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || disabled || !selectedName || !quantity}
            className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-red-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Send size={20} />}
            Valider la distribution
          </button>
        </form>
      </div>
    </div>
  );
};