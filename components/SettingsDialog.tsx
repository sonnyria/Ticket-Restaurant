import React, { useState, useEffect } from 'react';
import { X, Save, HelpCircle, AlertCircle } from 'lucide-react';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentUrl: string;
  onSave: (url: string) => void;
  onOpenHelp: () => void;
}

export const SettingsDialog: React.FC<SettingsDialogProps> = ({ 
  isOpen, 
  onClose, 
  currentUrl, 
  onSave,
  onOpenHelp
}) => {
  const [url, setUrl] = useState(currentUrl);
  const [error, setError] = useState('');

  useEffect(() => {
    setUrl(currentUrl);
  }, [currentUrl]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = url.trim();
    
    if (!cleanUrl.includes('script.google.com')) {
      setError('Veuillez entrer une URL valide de Google Apps Script.');
      return;
    }

    if (!cleanUrl.endsWith('/exec')) {
      setError('L\'URL doit se terminer par "/exec". Vérifiez votre lien de déploiement.');
      return;
    }

    setError('');
    onSave(cleanUrl);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in">
        <div className="bg-red-700 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            Configuration
          </h2>
          <button onClick={onClose} className="text-red-200 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              URL de l'application Web Apps Script
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://script.google.com/macros/s/.../exec"
              className="w-full p-4 bg-white border-2 border-slate-300 rounded-xl focus:ring-4 focus:ring-red-500/20 focus:border-red-600 outline-none transition-all text-slate-900 font-medium placeholder:text-slate-400 shadow-sm"
            />
            {error && (
              <p className="mt-2 text-red-600 text-sm flex items-center gap-1 font-medium bg-red-50 p-2 rounded">
                <AlertCircle size={16} className="shrink-0" /> {error}
              </p>
            )}
            <p className="mt-2 text-xs text-slate-500">
              Collez l'URL de déploiement de votre projet Apps Script ici (doit finir par <code className="bg-slate-100 px-1 rounded font-mono text-red-600">/exec</code>).
            </p>
          </div>

          <div className="bg-orange-50 border border-orange-100 rounded-lg p-4 flex items-start gap-3">
            <HelpCircle className="text-orange-500 shrink-0 mt-0.5" size={20} />
            <div>
              <h4 className="text-sm font-semibold text-orange-900">Première installation ?</h4>
              <p className="text-xs text-orange-800 mt-1">
                Si vous n'avez pas encore créé le lien entre votre Google Sheet et cette application, cliquez ci-dessous pour obtenir le code et la procédure.
              </p>
              <button 
                type="button"
                onClick={onOpenHelp}
                className="mt-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 px-3 py-1.5 rounded transition-colors shadow-sm"
              >
                Voir la procédure d'installation
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors shadow-md shadow-red-200"
            >
              <Save size={18} />
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};