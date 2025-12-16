import React, { useState } from 'react';
import { Plus, Minus, Edit3, Save, X, Loader2 } from 'lucide-react';
import { ActionType } from '../types';

interface TicketCounterProps {
  value: number;
  loading: boolean;
  onUpdate: (action: ActionType, val?: number) => void;
  disabled: boolean;
}

export const TicketCounter: React.FC<TicketCounterProps> = ({ value, loading, onUpdate, disabled }) => {
  const [isEditingTotal, setIsEditingTotal] = useState(false);
  const [editTotalValue, setEditTotalValue] = useState(value.toString());
  const [amount, setAmount] = useState<string>('');

  const handleManualTotalUpdate = () => {
    const num = parseInt(editTotalValue, 10);
    if (!isNaN(num)) {
      onUpdate(ActionType.SET, num);
      setIsEditingTotal(false);
    }
  };

  const handleEditOpen = () => {
    setEditTotalValue(value.toString());
    setIsEditingTotal(true);
  };

  const handleAction = (action: ActionType) => {
    const qty = parseInt(amount, 10);
    const valueToSend = isNaN(qty) || qty <= 0 ? 1 : qty;
    onUpdate(action, valueToSend);
    setAmount(''); // Reset input after action
  };

  const currentAmount = parseInt(amount, 10);
  const displayAmount = isNaN(currentAmount) || currentAmount <= 0 ? 1 : currentAmount;

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-3xl shadow-xl shadow-red-100/50 border border-red-100 overflow-hidden relative group">
        
        {/* Header Indicator */}
        <div className="h-3 bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 w-full" />

        <div className="p-8 text-center">
          <h2 className="text-red-800/60 font-bold tracking-widest text-xs uppercase mb-6">
            Stock de tickets disponibles
          </h2>

          <div className="relative flex justify-center items-center py-4 mb-2">
            {loading ? (
              <div className="h-32 flex items-center justify-center">
                 <Loader2 className="animate-spin text-red-500" size={64} />
              </div>
            ) : isEditingTotal ? (
              <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-200 py-6">
                <input 
                  type="number"
                  value={editTotalValue}
                  onChange={(e) => setEditTotalValue(e.target.value)}
                  className="text-6xl font-black text-slate-800 w-48 text-center border-b-4 border-red-500 bg-transparent outline-none focus:border-orange-500 transition-colors"
                  autoFocus
                  placeholder="Total"
                />
                <div className="flex gap-2">
                    <button
                      onClick={() => setIsEditingTotal(false)}
                      className="px-4 py-2 text-slate-400 hover:text-slate-600 rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                      <X size={18} /> Annuler
                    </button>
                    <button
                      onClick={handleManualTotalUpdate}
                      className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 shadow-lg shadow-red-200"
                    >
                      <Save size={18} /> Valider
                    </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center w-full">
                <div className="text-8xl font-black text-slate-800 tracking-tighter tabular-nums drop-shadow-sm mb-6">
                  {value}
                </div>
                
                {/* Section Input Quantité */}
                <div className="w-full bg-orange-50/50 rounded-2xl p-4 mb-4 border border-orange-100">
                  <label className="block text-xs font-bold text-orange-400 uppercase tracking-wide mb-2 text-left">
                    Quantité à manipuler
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="1"
                    className="w-full text-center text-3xl font-bold text-slate-800 bg-white border border-red-100 rounded-xl py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all placeholder:text-slate-200"
                  />
                </div>

                {/* Boutons d'action */}
                <div className="grid grid-cols-2 gap-4 w-full">
                  <button
                    onClick={() => handleAction(ActionType.DECREMENT)}
                    disabled={loading || disabled}
                    className="flex items-center justify-center gap-2 py-4 rounded-xl bg-red-50 border border-red-100 text-red-600 font-bold hover:bg-red-600 hover:text-white hover:border-red-600 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  >
                    <Minus size={20} strokeWidth={3} />
                    <span className="text-lg">Retirer {displayAmount}</span>
                  </button>

                  <button
                    onClick={() => handleAction(ActionType.INCREMENT)}
                    disabled={loading || disabled}
                    className="flex items-center justify-center gap-2 py-4 rounded-xl bg-green-50 border border-green-100 text-green-600 font-bold hover:bg-green-600 hover:text-white hover:border-green-600 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  >
                    <Plus size={20} strokeWidth={3} />
                    <span className="text-lg">Ajouter {displayAmount}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {!isEditingTotal && (
            <div className="flex justify-center mt-6 pt-4 border-t border-slate-50">
              <button
                onClick={handleEditOpen}
                disabled={loading || disabled}
                className="text-slate-400 hover:text-red-600 font-medium text-xs flex items-center gap-2 transition-colors px-4 py-2 hover:bg-red-50 rounded-lg uppercase tracking-wide"
              >
                <Edit3 size={14} /> Ajuster le total manuellement
              </button>
            </div>
          )}
        </div>
      </div>
      
      {disabled && !loading && (
        <div className="mt-4 text-center p-3 bg-amber-50 text-amber-800 rounded-lg text-sm border border-amber-100">
          ⚠️ Veuillez configurer l'URL du script dans les paramètres.
        </div>
      )}
    </div>
  );
};