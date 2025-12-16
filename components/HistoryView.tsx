import React, { useState, useMemo } from 'react';
import { Calendar, User, Filter, RefreshCw, AlertCircle, Trash2, Edit2, Save, X, Loader2 } from 'lucide-react';
import { HistoryItem, SheetPayload, ActionType } from '../types';

interface HistoryViewProps {
  data: HistoryItem[];
  names: string[];
  loading: boolean;
  onRefresh: () => void;
  onUpdateHistory: (payload: SheetPayload) => Promise<void>;
  disabled: boolean;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ data, names, loading, onRefresh, onUpdateHistory, disabled }) => {
  const [selectedName, setSelectedName] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>(''); // Format YYYY-MM
  
  // États d'édition et suppression
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [deletingRow, setDeletingRow] = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // Formulaire d'édition
  const [editDate, setEditDate] = useState('');
  const [editName, setEditName] = useState('');
  const [editQty, setEditQty] = useState('');

  const parseDate = (dateStr: string): Date | null => {
    if (!dateStr) return null;
    const parts = dateStr.split('/');
    if (parts.length !== 3) return null;
    return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
  };

  const formatDateForInput = (dateStr: string) => {
    const d = parseDate(dateStr);
    if (!d) return '';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDateFromInput = (isoDate: string) => {
    if (!isoDate) return '';
    const [year, month, day] = isoDate.split('-');
    return `${day}/${month}/${year}`;
  };

  const startEdit = (item: HistoryItem) => {
    if (!item.row) return;
    setEditingRow(item.row);
    setEditDate(formatDateForInput(item.date));
    setEditName(item.name);
    setEditQty(String(item.quantity));
    setDeletingRow(null);
  };

  const cancelEdit = () => {
    setEditingRow(null);
    setEditDate('');
    setEditName('');
    setEditQty('');
  };

  const handleSaveEdit = async (rowId: number) => {
    if (!editDate || !editName || !editQty) return;
    setActionLoading(true);
    await onUpdateHistory({
      action: ActionType.EDIT_HISTORY,
      row: rowId,
      date: formatDateFromInput(editDate),
      name: editName,
      quantity: Number(editQty)
    });
    setActionLoading(false);
    setEditingRow(null);
  };

  const handleDelete = async (rowId: number) => {
    setActionLoading(true);
    await onUpdateHistory({
      action: ActionType.DELETE_HISTORY,
      row: rowId
    });
    setActionLoading(false);
    setDeletingRow(null);
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
    <div className="w-full max-w-2xl mx-auto space-y-4 pb-20">
      
      {/* Header Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-end sm:items-center mb-4">
           <h3 className="font-bold text-slate-800 flex items-center gap-2">
             <Filter size={18} className="text-red-600" /> Filtres
           </h3>
           <button 
             onClick={onRefresh}
             disabled={loading || actionLoading}
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
                  <th className="px-4 py-3 w-20"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredData.map((row, idx) => {
                  const isEditing = editingRow === row.row;
                  const isDeleting = deletingRow === row.row;

                  return (
                    <tr key={idx} className={`group transition-colors ${isEditing || isDeleting ? 'bg-orange-50' : 'hover:bg-red-50/30'}`}>
                      {isEditing ? (
                        <>
                          <td className="px-2 py-3">
                            <input 
                              type="date" 
                              value={editDate} 
                              onChange={e => setEditDate(e.target.value)}
                              className="w-full text-xs p-1.5 border border-slate-300 rounded bg-white text-slate-900 focus:ring-1 focus:ring-red-500 outline-none"
                            />
                          </td>
                          <td className="px-2 py-3">
                            <select 
                              value={editName}
                              onChange={e => setEditName(e.target.value)}
                              className="w-full text-xs p-1.5 border border-slate-300 rounded bg-white text-slate-900 focus:ring-1 focus:ring-red-500 outline-none"
                            >
                              {names.map(n => <option key={n} value={n}>{n}</option>)}
                            </select>
                          </td>
                          <td className="px-2 py-3 text-right">
                             <input 
                              type="number" 
                              value={editQty} 
                              onChange={e => setEditQty(e.target.value)}
                              className="w-20 text-xs p-1.5 border border-slate-300 rounded bg-white text-right text-slate-900 focus:ring-1 focus:ring-red-500 outline-none"
                            />
                          </td>
                          <td className="px-2 py-3 text-right">
                            <div className="flex justify-end gap-1">
                               <button 
                                 onClick={() => row.row && handleSaveEdit(row.row)}
                                 disabled={actionLoading}
                                 className="p-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                               >
                                 {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                               </button>
                               <button onClick={cancelEdit} disabled={actionLoading} className="p-1 bg-slate-100 text-slate-600 rounded hover:bg-slate-200"><X size={16} /></button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">{row.date}</td>
                          <td className="px-4 py-3 text-sm font-medium text-slate-900">{row.name}</td>
                          <td className="px-4 py-3 text-sm font-bold text-red-700 text-right">{row.quantity}</td>
                          <td className="px-4 py-3 text-right">
                             {isDeleting ? (
                               <div className="flex items-center justify-end gap-2 animate-in fade-in zoom-in duration-200">
                                  <span className="text-[10px] text-red-600 font-bold uppercase">Sûr ?</span>
                                  <button 
                                    onClick={() => row.row && handleDelete(row.row)}
                                    disabled={actionLoading}
                                    className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                                  >
                                    Oui
                                  </button>
                                  <button onClick={() => setDeletingRow(null)} disabled={actionLoading} className="px-2 py-1 bg-white border border-slate-300 text-slate-600 text-xs rounded hover:bg-slate-100">Non</button>
                               </div>
                             ) : (
                               <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button 
                                    onClick={() => startEdit(row)}
                                    className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded" 
                                    title="Modifier"
                                  >
                                    <Edit2 size={14} />
                                  </button>
                                  <button 
                                    onClick={() => row.row && setDeletingRow(row.row)}
                                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded" 
                                    title="Supprimer"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                               </div>
                             )}
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};