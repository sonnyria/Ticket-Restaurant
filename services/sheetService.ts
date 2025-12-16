import { SheetPayload, TicketResponse } from '../types';

// Helper to perform the fetch request with consistent settings
const performRequest = async (scriptUrl: string, payload?: SheetPayload): Promise<TicketResponse> => {
  try {
    if (!scriptUrl) {
      throw new Error("URL du script manquante.");
    }

    const cleanUrl = scriptUrl.trim();
    
    // Validation basique de l'URL
    let urlObj: URL;
    try {
      urlObj = new URL(cleanUrl);
    } catch (e) {
      throw new Error("L'URL fournie est invalide.");
    }

    if (!cleanUrl.startsWith('http')) {
      throw new Error("L'URL doit commencer par https://");
    }

    // Ajout d'un timestamp pour éviter le cache du navigateur
    urlObj.searchParams.append('t', Date.now().toString());
    const targetUrl = urlObj.toString();

    const body = payload ? JSON.stringify(payload) : JSON.stringify({ action: 'read' });

    // Configuration optimisée pour Google Apps Script
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        // 'text/plain' est crucial : cela évite que le navigateur lance une requête "OPTIONS" (preflight)
        // que Google Apps Script gère parfois mal, causant des erreurs CORS.
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: body,
      mode: 'cors',
      credentials: 'omit', // Indispensable pour éviter les erreurs lors des redirections Google Auth
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => response.statusText);
      throw new Error(`Erreur HTTP ${response.status}: ${errText}`);
    }

    const text = await response.text();
    
    // Si le texte est vide, cela vient généralement d'une erreur silencieuse GAS
    if (!text || text.trim() === '') {
      throw new Error("Réponse vide. Vérifiez que le script est bien déployé en 'Application Web'.");
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error("JSON Parse Error. Raw text received:", text);
      // Détection des pages d'erreur HTML (souvent problème de permissions)
      if (text.includes('<!DOCTYPE html>') || text.includes('Google Accounts')) {
         throw new Error("Le script a renvoyé une page HTML au lieu de données JSON. Vérifiez que l'accès au déploiement est bien réglé sur 'Tout le monde' (Anyone).");
      }
      throw new Error("Format de réponse invalide. Le script ne renvoie pas du JSON correct.");
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
    
    let userMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    
    // Traduction de l'erreur générique réseau
    if (userMessage === 'Failed to fetch' || userMessage.includes('NetworkError') || userMessage.includes('Network request failed')) {
      userMessage = "Impossible de joindre le Google Sheet. Vérifiez votre connexion internet et l'URL du script.";
    }

    return {
      value: 0,
      names: [],
      history: [],
      status: 'error',
      message: userMessage
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