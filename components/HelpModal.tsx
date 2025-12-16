import React from 'react';
import { X, Copy, Check } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const codeSnippet = `
// --- CONFIGURATION ---
// Remplacez la valeur ci-dessous par l'ID de votre Google Sheet
// (C'est la partie de l'URL entre "/d/" et "/edit")
const SHEET_ID = "VOTRE_ID_SHEET_ICI"; 

const TARGET_CELL = "L2"; // Stock total
const NAMES_COL_INDEX = 11; // Colonne K (A=1, ... K=11)
const START_ROW_NAMES = 2; // Les noms commencent à la ligne 2

function doGet(e) {
  return handleRequest({ action: 'read' });
}

function doPost(e) {
  var data = { action: 'read' }; 
  if (e.postData && e.postData.contents) {
    try {
      data = JSON.parse(e.postData.contents);
    } catch(err) {
      return createResponse({ status: "error", message: "Invalid JSON" });
    }
  }
  return handleRequest(data);
}

function createResponse(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.TEXT);
}

function handleRequest(data) {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(15000)) return createResponse({ status: "error", message: "Busy" });
  
  try {
    var sheet = SpreadsheetApp.openById(SHEET_ID).getSheets()[0];
    
    // --- GESTION DES NOMS (Add/Edit/Delete) ---
    if (["add_name", "delete_name", "edit_name"].indexOf(data.action) !== -1) {
       var lastRow = sheet.getLastRow();
       var names = [];
       
       if (lastRow >= START_ROW_NAMES) {
         var numRows = lastRow - START_ROW_NAMES + 1;
         if (numRows > 0) {
           var range = sheet.getRange(START_ROW_NAMES, NAMES_COL_INDEX, numRows, 1);
           names = range.getValues().flat()
             .map(function(n) { return String(n).trim(); })
             .filter(function(n) { return n !== ""; });
           sheet.getRange(START_ROW_NAMES, NAMES_COL_INDEX, sheet.getMaxRows() - START_ROW_NAMES + 1, 1).clearContent();
         }
       }

       if (data.action === "add_name" && data.name) {
         var exists = names.some(function(n) { return n.toLowerCase() === String(data.name).trim().toLowerCase(); });
         if (!exists) names.push(data.name.trim());
       } 
       else if (data.action === "delete_name" && data.name) {
         var target = String(data.name).trim().toLowerCase();
         names = names.filter(function(n) { return String(n).trim().toLowerCase() !== target; });
       } 
       else if (data.action === "edit_name" && data.name && data.newName) {
         var target = String(data.name).trim().toLowerCase();
         var idx = names.findIndex(function(n) { return String(n).trim().toLowerCase() === target; });
         if (idx !== -1) names[idx] = data.newName.trim();
       }

       names.sort();
       if (names.length > 0) {
         sheet.getRange(START_ROW_NAMES, NAMES_COL_INDEX, names.length, 1)
              .setValues(names.map(function(n) { return [n]; }));
       }
       return createResponse({ names: names, status: "success" });
    }

    // --- ACTION: HISTORY ---
    if (data.action === "history") {
      var history = [];
      var lastRow = sheet.getLastRow();
      if (lastRow >= 2) {
        var values = sheet.getRange(2, 1, lastRow - 1, 3).getDisplayValues();
        history = values.map(function(row) {
          return { date: row[0], name: row[1], quantity: row[2] };
        }).filter(function(item) {
          return item.name !== "" && item.quantity !== "";
        }).reverse();
      }
      return createResponse({ history: history, status: "success" });
    }

    // --- ACTION: STOCK ---
    var rangeStock = sheet.getRange(TARGET_CELL);
    var currentStock = Number(rangeStock.getValue()) || 0;

    if (data && data.action !== 'read') {
      if (data.action === "transaction") {
        var qty = Number(data.quantity) || 0;
        currentStock -= qty;
        rangeStock.setValue(currentStock);
        sheet.appendRow([data.date, data.name, qty]);
      } 
      else if (["increment", "decrement", "set"].indexOf(data.action) !== -1) {
        var changeVal = (data.value !== undefined) ? Number(data.value) : 1;
        if (data.action === "increment") currentStock += changeVal;
        else if (data.action === "decrement") currentStock -= changeVal;
        else if (data.action === "set") currentStock = Number(data.value);
        rangeStock.setValue(currentStock);
      }
    }

    var namesList = [];
    var lastRowNames = sheet.getLastRow();
    if (lastRowNames >= START_ROW_NAMES) {
       var numRows = lastRowNames - START_ROW_NAMES + 1;
       if (numRows > 0) {
         namesList = sheet.getRange(START_ROW_NAMES, NAMES_COL_INDEX, numRows, 1)
           .getValues().flat()
           .map(function(n) { return String(n).trim(); })
           .filter(function(n) { return n !== ""; });
       }
    }

    return createResponse({ value: currentStock, names: namesList, status: "success" });

  } catch (e) {
    return createResponse({ status: "error", message: e.toString() });
  } finally {
    lock.releaseLock();
  }
}
  `;

  const handleCopy = () => {
    navigator.clipboard.writeText(codeSnippet.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50 rounded-t-xl">
          <h3 className="text-xl font-bold text-slate-800">Installation du Backend (Google Apps Script)</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
          
          {/* Instructions pas à pas */}
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold">1</div>
              <div className="text-sm text-slate-600">
                Ouvrez votre <strong>Google Sheet</strong>. Dans le menu en haut, cliquez sur <strong>Extensions</strong> &gt; <strong>Apps Script</strong>.
              </div>
            </div>

             <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold">2</div>
              <div className="text-sm text-slate-600">
                Effacez tout le code qui s'y trouve, et <strong className="text-slate-900">collez le code ci-dessous</strong> à la place.
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold">3</div>
              <div className="text-sm text-slate-600">
                <span className="text-red-600 font-bold bg-red-50 px-1 rounded">TRÈS IMPORTANT :</span> Tout en haut du code collé, remplacez <code>VOTRE_ID_SHEET_ICI</code> par l'ID de votre feuille.
                <br />
                <span className="text-xs text-slate-500 italic">(L'ID est la longue suite de caractères dans l'URL de votre navigateur, située entre <code>/d/</code> et <code>/edit</code>).</span>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold">4</div>
              <div className="text-sm text-slate-600">
                Cliquez sur le bouton bleu <strong>Déployer</strong> (en haut à droite) &gt; <strong>Nouveau déploiement</strong>.
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold">5</div>
              <div className="text-sm text-slate-600 space-y-1">
                Cliquez sur la roue dentée (Paramètres) à côté de "Sélectionner le type", et choisissez <strong>Application Web</strong>.
                <div className="bg-blue-50 border border-blue-100 rounded p-2 mt-1">
                   Configurez exactement comme ceci :
                   <ul className="list-disc list-inside mt-1 font-semibold text-blue-900">
                     <li>Description : <em>v1</em></li>
                     <li>Exécuter en tant que : <strong>Moi</strong> (votre email)</li>
                     <li>Qui peut accéder : <strong>Tout le monde</strong> <span className="text-xs font-normal text-blue-700">(Indispensable pour que l'app fonctionne)</span></li>
                   </ul>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold">6</div>
              <div className="text-sm text-slate-600">
                Cliquez sur <strong>Déployer</strong>. Copiez l'URL générée (qui se termine par <code>/exec</code>) et collez-la dans les paramètres de cette application.
              </div>
            </div>
          </div>

          {/* Code Block */}
          <div className="relative mt-6">
            <div className="absolute right-2 top-2 z-10">
              <button 
                onClick={handleCopy}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold transition-all shadow-sm ${
                  copied 
                    ? 'bg-green-100 text-green-700 border border-green-200' 
                    : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copié !' : 'Copier le code'}
              </button>
            </div>
            <pre className="bg-slate-900 text-slate-50 p-4 rounded-xl text-xs overflow-x-auto font-mono leading-relaxed border border-slate-800 shadow-inner max-h-96">
              <code>{codeSnippet.trim()}</code>
            </pre>
          </div>

          <div className="text-center text-xs text-slate-400 pt-4 border-t border-slate-100">
            Note : Si vous mettez à jour le code plus tard, n'oubliez pas de sélectionner "Nouvelle version" lors du déploiement.
          </div>
        </div>
      </div>
    </div>
  );
};