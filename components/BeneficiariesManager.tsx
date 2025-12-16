import React, { useState } from 'react';
import { UserPlus, Trash2, Edit2, Save, X, User, Check, AlertTriangle } from 'lucide-react';
import { SheetPayload, ActionType } from '../types';

interface BeneficiariesManagerProps {
  names: string[];
  loading: boolean;
  onUpdateName: (payload: SheetPayload) => void;
  disabled: boolean;
}

export const BeneficiariesManager: React.FC<BeneficiariesManagerProps> = ({ names, loading, onUpdateName, disabled }) => {
  const [newName, setNewName] = useState('');
  
  // États pour l'édition
  const [editingName, setEditingName] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  
  // États pour la suppression (confirmation visuelle)
  const [deletingName, setDeletingName] = useState<string | null>(null);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    onUpdateName({ action: ActionType.ADD_NAME, name: newName.trim() });
    setNewName('');
  };

  const initiateDelete = (name: string) => {
    setDeletingName(name);
    setEditingName(null);
  };

  const cancelDelete = () => {
    setDeletingName(null);
  };

  const confirmDelete = (name: string) => {
    onUpdateName({ action: ActionType.DELETE_NAME, name });
    setDeletingName(null);
  };

  const startEdit = (name: string) => {
    setEditingName(name);
    setEditValue(name);
    setDeletingName(null);
  };

  const cancelEdit = () => {
    setEditingName(null);
    setEditValue('');
  };

  const saveEdit = () => {
    if (editingName && editValue.trim() && editValue !== editingName) {
      onUpdateName({ 
        action: ActionType.EDIT_NAME, 
        name: editingName, 
        newName: editValue.trim() 
      });
    }
    setEditingName(null);
  };

  if (disabled) {
    return (
      <div className="bg-white p-8 rounded-3xl shadow-lg border border-red-100 text-center">
         <p className="text-slate-500">Veuillez configurer l'URL du script pour gérer les bénéficiaires.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      
      {/* Add New Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-5">
        <h3 className="text-sm font-bold text-red-800 mb-3 flex items-center gap-2 uppercase tracking-wide">
          <UserPlus size={16} className="text-red-500" /> Ajouter un bénéficiaire
        </h3>
        <form onSubmit={handleAdd} className="flex gap-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nom Prénom"
            disabled={loading}
            className="flex-1 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-red-500 transition-all focus:bg-white"
          />
          <button
            type="submit"
            disabled={loading || !newName.trim()}
            className="bg-red-600 hover:bg-red-700 text-white rounded-xl px-4 py-2 font-medium transition-colors disabled:opacity-50"
          >
            Ajouter
          </button>
        </form>
      </div>

      {/* List Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 px-5 py-3 border-b border-slate-100 flex justify-between items-center">
           <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide">Liste ({names.length})</h3>
        </div>
        
        <ul className="divide-y divide-slate-100 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {names.length === 0 ? (
            <li className="p-8 text-center text-slate-400 italic">
              Aucun bénéficiaire enregistré.
            </li>
          ) : (
            names.map((name, idx) => {
              const isDeleting = deletingName === name;
              const isEditing = editingName === name;

              return (
                <li key={idx} className={`px-5 py-3 transition-colors flex items-center justify-between group ${isDeleting ? 'bg-red-50' : 'hover:bg-slate-50'}`}>
                  
                  {isEditing ? (
                    // MODE ÉDITION
                    <div className="flex-1 flex items-center gap-2 pr-2">
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="flex-1 bg-white border border-red-300 rounded-lg px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-red-500"
                        autoFocus
                      />
                      <button onClick={saveEdit} className="p-1 text-green-600 hover:bg-green-50 rounded" title="Sauvegarder">
                        <Check size={18} />
                      </button>
                      <button onClick={cancelEdit} className="p-1 text-slate-400 hover:bg-slate-100 rounded" title="Annuler">
                        <X size={18} />
                      </button>
                    </div>
                  ) : isDeleting ? (
                    // MODE SUPPRESSION (CONFIRMATION)
                    <div className="flex-1 flex items-center justify-between animate-in fade-in duration-200">
                      <div className="flex items-center gap-2 text-red-700 font-medium text-sm">
                        <AlertTriangle size={16} />
                        <span>Supprimer ?</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => confirmDelete(name)} 
                          className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition-colors shadow-sm"
                        >
                          Oui
                        </button>
                        <button 
                          onClick={cancelDelete} 
                          className="px-3 py-1 bg-white border border-slate-300 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-100 transition-colors"
                        >
                          Non
                        </button>
                      </div>
                    </div>
                  ) : (
                    // MODE AFFICHAGE STANDARD
                    <>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                          <User size={14} />
                        </div>
                        <span className="text-slate-700 font-medium">{name}</span>
                      </div>
                      
                      <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => startEdit(name)}
                          disabled={loading}
                          className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => initiateDelete(name)}
                          disabled={loading}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </>
                  )}
                </li>
              );
            })
          )}
        </ul>
      </div>
    </div>
  );
};