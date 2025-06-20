
export interface DashboardStats {
  total_deposits: number;
  total_withdrawals: number;
  total_deposits_amount?: number;
  total_withdrawals_amount?: number;
  client_count: number;
  transfer_count: number;
  total_balance: number;
  sent_transfers: number;
  received_transfers: number;
  monthly_stats: MonthlyStats[];
}

export interface MonthlyStats {
  day: string;
  total_deposits: number;
  total_withdrawals: number;
  deposits_count: number;
  withdrawals_count: number;
  deposit_count?: number;
  withdrawal_count?: number;
}

export interface RecentActivity {
  id: string;
  type: 'deposit' | 'withdrawal' | 'transfer';
  amount: number;
  date: string;
  client_name: string;
  fromClient?: string;
  toClient?: string;
  status: string;
  description: string;
}
