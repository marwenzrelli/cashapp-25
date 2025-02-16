
export interface Deposit {
  id: string;
  client_name: string;
  amount: number;
  date: string;
  description: string;
  status?: string;
  created_at?: string;
  created_by?: string;
}

export interface AISuggestion {
  id: string;
  message: string;
  amount: number;
  clientName: string;
}

export interface EditFormData {
  clientName: string;
  amount: string;
  notes: string;
}

export interface NewDepositData {
  clientName: string;
  amount: string;
  notes: string;
}
