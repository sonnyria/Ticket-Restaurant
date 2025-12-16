import { SheetPayload, TicketResponse } from '../types';

// Helper to perform the fetch request with consistent settings
const performRequest = async (scriptUrl: string, payload?: SheetPayload): Promise<TicketResponse> => {
  try {
    if (!scriptUrl) {
      throw new Error("URL du script manquante.");
    }

    // Ajout d'un timestamp pour éviter le cache du navigateur
    const cacheBuster = `?t=${Date.now()}`;
    const targetUrl = scriptUrl.includes('?') ? `${scriptUrl}&t=${Date.now()}` : `${scriptUrl}${cacheBuster}`;

    const body = payload ? JSON.stringify(payload) : JSON.stringify({ action: 'read' });

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: body,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const text = await response.text();
    
    // Si le texte est vide, cela vient généralement d'une erreur silencieuse GAS
    if (!text || text.trim() === '') {
      throw new Error("Le script Google a renvoyé une réponse vide. Assurez-vous d'avoir déployé la version v2.6 du script.");
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error("JSON Parse Error. Raw text received:", text);
      throw new Error("Format de réponse invalide. Vérifiez que vous avez bien mis à jour le script Apps Script (v2.6).");
    }

    if (data.status === 'error') {
      throw new Error(data.message || 'Erreur du script Google');
    }

    return {
      value: Number(data.value),
      names: data.names || [],
      history: data.history || [],
      status: 'success'
    };
  } catch (error) {
    console.error("Service Request failed:", error);
    return {
      value: 0,
      names: [],
      history: [],
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

export const fetchTicketCount = async (scriptUrl: string): Promise<TicketResponse> => {
  return performRequest(scriptUrl, { action: 'read' });
};

export const fetchHistory = async (scriptUrl: string): Promise<TicketResponse> => {
  return performRequest(scriptUrl, { action: 'history' });
};

export const updateTicketCount = async (scriptUrl: string, payload: SheetPayload): Promise<TicketResponse> => {
  return performRequest(scriptUrl, payload);
};
