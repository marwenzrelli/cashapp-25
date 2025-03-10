
export interface DashboardStats {
  total_deposits: number;
  total_withdrawals: number;
  client_count: number;
  transfer_count: number;
  total_balance: number;
  sent_transfers: number;
  received_transfers: number;
  monthly_stats: any[];
}

export interface RecentActivity {
  id: string;
  type: 'deposit' | 'withdrawal' | 'transfer';
  amount: number;
  date: string;
  client_name: string;
  status: string;
  description?: string;
  fromClient?: string;
  toClient?: string;
}

export type SortOption = 
  | 'date-desc' 
  | 'date-asc' 
  | 'amount-desc' 
  | 'amount-asc' 
  | 'type'
  | 'type-desc'
  | 'category'
  | 'client';
