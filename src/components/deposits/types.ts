
export interface Deposit {
  id: string;
  clientName: string;
  amount: number;
  date: string;
  notes: string;
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
