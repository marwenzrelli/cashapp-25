
import { filterByDateRange } from "./dateHelpers";

export const calculateTotals = (
  filteredDeposits: any[],
  filteredWithdrawals: any[],
  filteredTransfers: any[]
) => {
  const totalDeposits = filteredDeposits.reduce((acc, dep) => acc + (dep.amount || 0), 0);
  const totalWithdrawals = filteredWithdrawals.reduce((acc, withdrawal) => acc + (withdrawal.amount || 0), 0);
  const totalTransfers = filteredTransfers.reduce((acc, transfer) => acc + (transfer.amount || 0), 0);
  
  return {
    totalDeposits,
    totalWithdrawals,
    totalTransfers
  };
};

export const calculateMonthlyComparison = (
  filteredDeposits: any[],
  filteredWithdrawals: any[],
  filteredTransfers: any[],
  monthBoundaries: { 
    currentMonth: { start: Date, end: Date }, 
    lastMonth: { start: Date, end: Date } 
  }
) => {
  const { currentMonth, lastMonth } = monthBoundaries;
  
  const currentMonthDeposits = filterByDateRange(filteredDeposits, currentMonth.start, currentMonth.end);
  const currentMonthWithdrawals = filterByDateRange(filteredWithdrawals, currentMonth.start, currentMonth.end);
  const currentMonthTransfers = filterByDateRange(filteredTransfers, currentMonth.start, currentMonth.end);
  
  const lastMonthDeposits = filterByDateRange(filteredDeposits, lastMonth.start, lastMonth.end);
  const lastMonthWithdrawals = filterByDateRange(filteredWithdrawals, lastMonth.start, lastMonth.end);
  const lastMonthTransfers = filterByDateRange(filteredTransfers, lastMonth.start, lastMonth.end);

  const currentMonthTotal = currentMonthDeposits.reduce((acc, dep) => acc + (dep.amount || 0), 0) -
    currentMonthWithdrawals.reduce((acc, w) => acc + (w.amount || 0), 0) +
    currentMonthTransfers.reduce((acc, transfer) => acc + (transfer.amount || 0), 0);
  
  const lastMonthTotal = lastMonthDeposits.reduce((acc, dep) => acc + (dep.amount || 0), 0) -
    lastMonthWithdrawals.reduce((acc, w) => acc + (w.amount || 0), 0) +
    lastMonthTransfers.reduce((acc, transfer) => acc + (transfer.amount || 0), 0);
  
  const percentageChange = lastMonthTotal !== 0 
    ? ((currentMonthTotal - lastMonthTotal) / lastMonthTotal) * 100 
    : 0;

  return { percentageChange };
};

export const calculateDailyTransactions = (
  filteredDeposits: any[],
  filteredWithdrawals: any[],
  filteredTransfers: any[]
) => {
  // Combine all transactions and filter out any with invalid dates
  const allTransactions = [
    ...filteredDeposits,
    ...filteredWithdrawals, 
    ...filteredTransfers
  ].filter(op => {
    const dateStr = op.created_at || op.operation_date || '';
    return dateStr && !isNaN(new Date(dateStr).getTime());
  });

  // Daily transactions
  const dailyTransactions = allTransactions.reduce((acc, op) => {
    try {
      const dateStr = op.created_at || op.operation_date || '';
      const date = new Date(dateStr).toLocaleDateString();
      
      // Only process if we have a valid date
      if (date && !isNaN(new Date(date).getTime())) {
        const currentCount = acc[date] || 0;
        acc[date] = currentCount + 1;
      }
    } catch (error) {
      console.warn("Error formatting operation date:", op.created_at || op.operation_date);
    }
    return acc;
  }, {} as Record<string, number>);

  // Calculate the total number of transactions using a properly typed reduce function
  const totalTransactions = Object.values(dailyTransactions).reduce<number>(
    (sum, count) => sum + (typeof count === 'number' ? count : 0), 
    0
  );
  
  const daysCount = Math.max(Object.keys(dailyTransactions).length, 1);
  
  // Ensure the values are properly typed for the division operation
  const averageTransactionsPerDay = totalTransactions / daysCount;
    
  return { averageTransactionsPerDay };
};

export const validateStatisticsData = (
  stats: any,
  deposits: any[],
  withdrawals: any[],
  transfersArray: any[]
) => {
  return typeof stats === 'object' && 
    stats !== null && 
    Array.isArray(deposits) && 
    Array.isArray(withdrawals) && 
    Array.isArray(transfersArray);
};

export const ensureSafeStats = (stats: any) => {
  return {
    total_deposits: stats?.total_deposits || 0,
    total_withdrawals: stats?.total_withdrawals || 0,
    client_count: stats?.client_count || 0,
    transfer_count: stats?.transfer_count || 0,
    total_balance: stats?.total_balance || 0,
    sent_transfers: stats?.sent_transfers || 0,
    received_transfers: stats?.received_transfers || 0,
    monthly_stats: stats?.monthly_stats || []
  };
};
