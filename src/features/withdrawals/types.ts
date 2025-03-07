
export interface Withdrawal {
  id: string;
  client_name: string;
  amount: number;
  date: string;
  operation_date: string;
  notes: string;
  status: string;
  created_at?: string;
  last_modified_at?: string;
}
