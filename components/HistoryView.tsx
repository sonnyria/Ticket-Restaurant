import React, { useState, useMemo } from 'react';
import { Calendar, User, Filter, RefreshCw, AlertCircle } from 'lucide-react';
import { HistoryItem } from '../types';

interface HistoryViewProps {
  data: HistoryItem[];
  names: string[];
  loading: boolean;
  onRefresh: () => void;
  disabled: boolean;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ data, names, loading, onRefresh, disabled }) => {
  const [selectedName, setSelectedName] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>(''); // Format YYYY-MM

  const parseDate = (dateStr: string): Date | null => {
    if (!dateStr) return null;
    const parts = dateStr.split('/');
    if (parts.length !== 3) return null;
    return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
  };

  const filteredData = useMemo(() => {
    return data.filter(item => {
      if (selectedName !== 'all' && item.name !== selectedName) return false;
      
      if (selectedMonth) {
        const itemDate = parseDate(item.date);
        if (itemDate) {
          const itemYearMonth = `${itemDate.getFullYear()}-${String(itemDate.getMonth() + 1).padStart(2, '0')}`;
          if (itemYearMonth !== selectedMonth) return false;
        }
      }
      return true;
    });
  }, [data, selectedName, selectedMonth]);

  const totalTickets = filteredData.reduce((acc, curr) => acc + (Number(curr.quantity) || 0), 0);

  if (disabled) {
    return (
      <div className="bg-white p-8 rounded-3xl shadow-lg border border-red-100 text-center">
         <p className="text-slate-500">Veuillez configurer l'URL du script pour voir l'historique.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      
      {/* Header Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-end sm:items-center mb-4">
           <h3 className="font-bold text-slate-800 flex items-center gap-2">
             <Filter size={18} className="text-red-600" /> Filtres
           </h3>
           <button 
             onClick={onRefresh}
             disabled={loading}
             className="text-xs font-medium text-slate-500 hover:text-red-600 flex items-center gap-1 transition-colors"
           >
             <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Actualiser
           </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Filtre Mois */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1">
              <Calendar size={12} /> Mois
            </label>
            <input 
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>

          {/* Filtre Nom */}
          <div className="space-y-1">
             <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1">
              <User size={12} /> Bénéficiaire
            </label>
            <select
              value={selectedName}
              onChange={(e) => setSelectedName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 appearance-none"
            >
              <option value="all">Tous les bénéficiaires</option>
              {names.map((n, i) => (
                <option key={i} value={n}>{n}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Résumé */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl p-4 shadow-lg shadow-red-200 text-white flex justify-between items-center">
        <div>
           <p className="text-red-100 text-xs font-medium mb-1">Total distribué (sélection)</p>
           <p className="text-3xl font-bold">{totalTickets}</p>
        </div>
        <div className="bg-white/10 p-2 rounded-lg">
           <span className="text-xs font-medium px-2 py-1 bg-white/20 rounded-full">
             {filteredData.length} lignes
           </span>
        </div>
      </div>

      {/* Liste */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {filteredData.length === 0 ? (
          <div className="p-8 text-center text-slate-400 flex flex-col items-center gap-2">
            <AlertCircle size={32} className="opacity-50" />
            <p className="text-sm">Aucune donnée trouvée.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Nom</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase text-right">Qté</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-red-50/50 transition-colors">
                    <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">{row.date}</td>
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">{row.name}</td>
                    <td className="px-4 py-3 text-sm font-bold text-red-700 text-right">{row.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};