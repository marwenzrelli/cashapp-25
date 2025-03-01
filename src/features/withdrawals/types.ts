
export interface Withdrawal {
  id: string;
  client_name: string;
  amount: number;
  date: string;
  operation_date?: string;
  created_at?: string;
  notes: string;
  status: string;
}
