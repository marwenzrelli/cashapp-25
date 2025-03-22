
export interface Deposit {
  id: number;
  amount: number;
  date: string;
  description: string;
  client_name: string;
  client_id?: string | number; // Updated to accept both string and number
  status: string;
  created_at: string;
  created_by: string | null;
  operation_date?: string;
  last_modified_at?: string; // New field to track modifications
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
  date?: string;
  time?: string;
  clientBalance?: string;
}
