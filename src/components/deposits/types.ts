
export interface Deposit {
  id: number;
  amount: number;
  date: string;
  description: string;
  client_name: string;
  status: string;
  created_at: string;
  created_by: string | null;
  operation_date?: string; // Ajout du champ operation_date
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
