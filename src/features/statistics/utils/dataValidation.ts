
import { safeNumber } from './safeConversion';

export const validateStatisticsData = (
  stats: any,
  deposits: any[],
  withdrawals: any[],
  transfersArray: any[]
) => {
  // Basic validation with array fallbacks
  const validStats = typeof stats === 'object' && stats !== null;
  const validDeposits = Array.isArray(deposits);
  const validWithdrawals = Array.isArray(withdrawals);
  const validTransfers = Array.isArray(transfersArray);
  
  // Always return true if we have basic valid data structure
  // This allows the UI to render with available data even if some is missing
  return validStats || validDeposits || validWithdrawals || validTransfers;
};

export const ensureSafeStats = (stats: any) => {
  if (!stats || typeof stats !== 'object') {
    return {
      total_deposits: 0,
      total_withdrawals: 0,
      client_count: 0,
      transfer_count: 0,
      total_balance: 0,
      sent_transfers: 0,
      received_transfers: 0,
      monthly_stats: []
    };
  }
  
  return {
    total_deposits: safeNumber(stats?.total_deposits),
    total_withdrawals: safeNumber(stats?.total_withdrawals),
    client_count: safeNumber(stats?.client_count),
    transfer_count: safeNumber(stats?.transfer_count),
    total_balance: safeNumber(stats?.total_balance),
    sent_transfers: safeNumber(stats?.sent_transfers),
    received_transfers: safeNumber(stats?.received_transfers),
    monthly_stats: Array.isArray(stats?.monthly_stats) ? stats.monthly_stats : []
  };
};
