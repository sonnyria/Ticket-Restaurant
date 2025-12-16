import React, { useState, useEffect, useCallback } from 'react';
import { Settings, RefreshCw, Package, Send, History, Users, Utensils } from 'lucide-react';
import { TicketCounter } from './components/TicketCounter';
import { TransactionForm } from './components/TransactionForm';
import { HistoryView } from './components/HistoryView';
import { BeneficiariesManager } from './components/BeneficiariesManager';
import { SettingsDialog } from './components/SettingsDialog';
import { HelpModal } from './components/HelpModal';
import { fetchTicketCount, updateTicketCount, fetchHistory } from './services/sheetService';
import { ActionType, SheetPayload, HistoryItem } from './types';

const App: React.FC = () => {
  const [ticketCount, setTicketCount] = useState<number>(0);
  const [namesList, setNamesList] = useState<string[]>([]);
  const [historyData, setHistoryData] = useState<HistoryItem[]>([]);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState<boolean>(false);
  const [isTransactionLoading, setIsTransactionLoading] = useState<boolean>(false);
  const [isNamesLoading, setIsNamesLoading] = useState<boolean>(false);
  
  const [scriptUrl, setScriptUrl] = useState<string>('');
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  // Gestion des onglets
  const [activeTab, setActiveTab] = useState<'stock' | 'distribution' | 'history' | 'beneficiaries'>('stock');

  // Load URL from local storage on mount
  useEffect(() => {
    const savedUrl = localStorage.getItem('sheet_script_url');
    if (savedUrl) {
      setScriptUrl(savedUrl);
    } else {
      setIsSettingsOpen(true);
    }
  }, []);

  const refreshMainData = useCallback(async () => {
    if (!scriptUrl) return;
    setIsLoading(true);
    const result = await fetchTicketCount(scriptUrl);
    if (result.status === 'success') {
      setTicketCount(result.value);
      if (result.names) setNamesList(result.names);
      setLastUpdated(new Date());
    } else {
      console.error(result.message);
    }
    setIsLoading(false);
  }, [scriptUrl]);

  const loadHistory = useCallback(async () => {
    if (!scriptUrl) return;
    setIsHistoryLoading(true);
    const result = await fetchHistory(scriptUrl);
    if (result.status === 'success' && result.history) {
      setHistoryData(result.history);
    } else {
      console.error(result.message);
    }
    setIsHistoryLoading(false);
  }, [scriptUrl]);

  // Chargement initial ou changement d'URL
  useEffect(() => {
    if (scriptUrl) {
      refreshMainData();
    }
  }, [scriptUrl, refreshMainData]);

  // Chargement de l'historique quand on change d'onglet
  useEffect(() => {
    if (activeTab === 'history' && scriptUrl) {
      loadHistory();
    }
  }, [activeTab, scriptUrl, loadHistory]);

  const handleSaveSettings = (url: string) => {
    setScriptUrl(url);
    localStorage.setItem('sheet_script_url', url);
  };

  const handleCounterUpdate = async (action: ActionType, value?: number) => {
    if (!scriptUrl) return;
    
    const previousValue = ticketCount;
    const delta = value || 1; 

    if (action === ActionType.INCREMENT) setTicketCount(prev => prev + delta);
    if (action === ActionType.DECREMENT) setTicketCount(prev => prev - delta);
    if (action === ActionType.SET && value !== undefined) setTicketCount(value);

    setIsLoading(true);
    const payload: SheetPayload = { action, value };
    const result = await updateTicketCount(scriptUrl, payload);

    if (result.status === 'success') {
      setTicketCount(result.value);
      setLastUpdated(new Date());
    } else {
      setTicketCount(previousValue);
      alert(`Erreur : ${result.message}`);
    }
    setIsLoading(false);
  };

  const handleTransaction = async (payload: SheetPayload) => {
    if (!scriptUrl) return;

    const qty = payload.quantity || 0;
    const previousValue = ticketCount;
    setTicketCount(prev => prev - qty);

    setIsTransactionLoading(true);
    const result = await updateTicketCount(scriptUrl, payload);

    if (result.status === 'success') {
      setTicketCount(result.value);
      if (result.names) setNamesList(result.names);
      setLastUpdated(new Date());
      // Invalider l'historique pour le recharger la prochaine fois
      setHistoryData([]); 
      // On reste sur l'onglet distribution pour enchaîner les saisies
    } else {
      setTicketCount(previousValue);
      alert(`Erreur lors de l'enregistrement : ${result.message}`);
    }
    setIsTransactionLoading(false);
  };

  // Gestion de l'ajout/suppression/modif de noms
  const handleNameUpdate = async (payload: SheetPayload) => {
    if (!scriptUrl) return;
    
    setIsNamesLoading(true);
    const result = await updateTicketCount(scriptUrl, payload);
    
    if (result.status === 'success' && result.names) {
      setNamesList(result.names);
    } else {
      alert(`Erreur lors de la mise à jour de la liste : ${result.message}`);
    }
    setIsNamesLoading(false);
  };

  // Gestion de l'édition/suppression d'historique
  const handleHistoryUpdate = async (payload: SheetPayload) => {
    if (!scriptUrl) return;
    
    // On ne met pas à jour l'état optimiste ici car c'est complexe (modification de liste + stock)
    // On attend la réponse du serveur
    const result = await updateTicketCount(scriptUrl, payload);

    if (result.status === 'success') {
      // Le backend nous renvoie le nouveau stock calculé
      setTicketCount(result.value);
      setLastUpdated(new Date());
      // On recharge l'historique pour voir les modifs
      await loadHistory();
    } else {
      alert(`Erreur lors de la modification : ${result.message}`);
    }
  };

  const tabs = [
    { id: 'stock', label: 'Stock', icon: Package },
    { id: 'distribution', label: 'Distrib.', icon: Send },
    { id: 'beneficiaries', label: 'Bénéficiaires', icon: Users },
    { id: 'history', label: 'Historique', icon: History },
  ] as const;

  return (
    <div className="min-h-screen bg-orange-50/50 text-slate-900 font-sans flex flex-col">
      {/* Navbar + Tabs Container */}
      <div className="bg-white border-b border-red-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-5xl mx-auto">
          {/* Top Bar */}
          <div className="px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center border-b border-red-50">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-red-600 to-orange-600 w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-lg shadow-red-200 transform -rotate-3">
                <Utensils size={20} strokeWidth={2.5} />
              </div>
              <h1 className="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-red-700 to-orange-600 hidden sm:block tracking-tight">
                Ticket Restaurant
              </h1>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={refreshMainData}
                disabled={!scriptUrl || isLoading}
                className="p-2 text-red-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Actualiser"
              >
                <RefreshCw size={20} className={isLoading ? "animate-spin" : ""} />
              </button>
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 text-red-300 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                title="Paramètres"
              >
                <Settings size={20} />
              </button>
            </div>
          </div>

          {/* Tab Navigation (Top) */}
          <div className="flex px-4 sm:px-6 gap-6 overflow-x-auto no-scrollbar">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-3 border-b-[3px] text-sm font-bold transition-all whitespace-nowrap rounded-t-md ${
                  activeTab === tab.id
                    ? 'border-red-600 text-red-700 bg-red-50/50'
                    : 'border-transparent text-slate-400 hover:text-red-500 hover:border-red-200'
                }`}
              >
                <tab.icon size={18} className={activeTab === tab.id ? 'stroke-[2.5px]' : ''} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-start p-4 sm:p-6 relative overflow-y-auto custom-scrollbar">
        
        {/* Decorative Background */}
        <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-red-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-amber-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10 w-full max-w-xl">
          
          {activeTab === 'stock' && (
            <div className="animate-in fade-in zoom-in-95 duration-300">
              <TicketCounter 
                value={ticketCount} 
                loading={isLoading && ticketCount === 0} 
                onUpdate={handleCounterUpdate}
                disabled={!scriptUrl}
              />
              {lastUpdated && (
                <p className="text-center text-red-300 text-xs mt-6 font-medium">
                  Dernière mise à jour : {lastUpdated.toLocaleTimeString()}
                </p>
              )}
            </div>
          )}

          {activeTab === 'distribution' && (
            <div className="animate-in slide-in-from-right-8 duration-300">
               {scriptUrl ? (
                  <TransactionForm 
                    names={namesList}
                    loading={isTransactionLoading || isLoading}
                    onTransaction={handleTransaction}
                    disabled={!scriptUrl}
                  />
               ) : (
                 <div className="bg-white p-8 rounded-3xl shadow-lg border border-red-100 text-center">
                    <p className="text-slate-500 mb-4">Veuillez configurer l'URL du script.</p>
                 </div>
               )}
            </div>
          )}

          {activeTab === 'beneficiaries' && (
            <div className="animate-in slide-in-from-right-8 duration-300">
              <BeneficiariesManager 
                names={namesList}
                loading={isNamesLoading}
                onUpdateName={handleNameUpdate}
                disabled={!scriptUrl}
              />
            </div>
          )}

          {activeTab === 'history' && (
            <div className="animate-in slide-in-from-right-8 duration-300">
              <HistoryView 
                data={historyData}
                names={namesList}
                loading={isHistoryLoading}
                onRefresh={loadHistory}
                onUpdateHistory={handleHistoryUpdate}
                disabled={!scriptUrl}
              />
            </div>
          )}
          
        </div>
      </main>

      <SettingsDialog 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        currentUrl={scriptUrl}
        onSave={handleSaveSettings}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      <HelpModal 
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />

    </div>
  );
};

export default App;