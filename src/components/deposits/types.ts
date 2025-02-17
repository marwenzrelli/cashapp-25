
export interface Deposit {
  id: number;
  amount: number;
  date: string;
  description: string;
  client_name: string;
  status: string;
  created_at: string;
  created_by: string | null;
}
