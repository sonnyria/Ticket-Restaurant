
export interface TicketResponse {
  value: number;
  names?: string[];
  history?: HistoryItem[];
  status: 'success' | 'error';
  message?: string;
}

export interface HistoryItem {
  date: string;
  name: string;
  quantity: string | number;
  row?: number; // Index de la ligne dans le sheet
}

export interface SheetConfig {
  scriptUrl: string;
}

export enum ActionType {
  INCREMENT = 'increment',
  DECREMENT = 'decrement',
  SET = 'set',
  TRANSACTION = 'transaction',
  READ = 'read',
  HISTORY = 'history',
  ADD_NAME = 'add_name',
  DELETE_NAME = 'delete_name',
  EDIT_NAME = 'edit_name',
  DELETE_HISTORY = 'delete_history',
  EDIT_HISTORY = 'edit_history'
}

export interface SheetPayload {
  action: ActionType | string;
  value?: number;
  date?: string;
  name?: string;
  newName?: string; // Pour le renommage
  quantity?: number;
  row?: number; // Pour identifier la ligne d'historique
}
