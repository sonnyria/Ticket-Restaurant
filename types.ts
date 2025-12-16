
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
  EDIT_NAME = 'edit_name'
}

export interface SheetPayload {
  action: ActionType | string;
  value?: number;
  date?: string;
  name?: string;
  newName?: string; // Pour le renommage
  quantity?: number;
}
