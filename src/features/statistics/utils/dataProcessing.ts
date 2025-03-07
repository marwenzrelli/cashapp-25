
import { filterByDateRange } from "./dateHelpers";

export const calculateTotals = (
  filteredDeposits: any[],
  filteredWithdrawals: any[],
  filteredTransfers: any[]
) => {
  const totalDeposits = filteredDeposits.reduce((acc, dep) => acc + (dep?.amount || 0), 0);
  const totalWithdrawals = filteredWithdrawals.reduce((acc, withdrawal) => acc + (withdrawal?.amount || 0), 0);
  const totalTransfers = filteredTransfers.reduce((acc, transfer) => acc + (transfer?.amount || 0), 0);
  
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

  // Calculate totals with safer number handling
  const currentMonthDepositsTotal = currentMonthDeposits.reduce((acc, dep) => acc + (Number(dep?.amount) || 0), 0);
  const currentMonthWithdrawalsTotal = currentMonthWithdrawals.reduce((acc, w) => acc + (Number(w?.amount) || 0), 0);
  const currentMonthTransfersTotal = currentMonthTransfers.reduce((acc, t) => acc + (Number(t?.amount) || 0), 0);
  
  const lastMonthDepositsTotal = lastMonthDeposits.reduce((acc, dep) => acc + (Number(dep?.amount) || 0), 0);
  const lastMonthWithdrawalsTotal = lastMonthWithdrawals.reduce((acc, w) => acc + (Number(w?.amount) || 0), 0);
  const lastMonthTransfersTotal = lastMonthTransfers.reduce((acc, t) => acc + (Number(t?.amount) || 0), 0);
  
  const currentMonthTotal = currentMonthDepositsTotal - currentMonthWithdrawalsTotal + currentMonthTransfersTotal;
  const lastMonthTotal = lastMonthDepositsTotal - lastMonthWithdrawalsTotal + lastMonthTransfersTotal;
  
  // Avoid division by zero
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
  // Ensure all arrays are valid
  const safeDeposits = Array.isArray(filteredDeposits) ? filteredDeposits : [];
  const safeWithdrawals = Array.isArray(filteredWithdrawals) ? filteredWithdrawals : [];
  const safeTransfers = Array.isArray(filteredTransfers) ? filteredTransfers : [];
  
  // Combine all transactions and filter out any with invalid dates
  const allTransactions = [
    ...safeDeposits,
    ...safeWithdrawals, 
    ...safeTransfers
  ].filter(op => {
    if (!op) return false;
    const dateStr = op.created_at || op.operation_date || '';
    try {
      const date = new Date(dateStr);
      return dateStr && !isNaN(date.getTime());
    } catch (error) {
      console.error("Invalid date format:", dateStr);
      return false;
    }
  });

  // Daily transactions with improved error handling
  const dailyTransactions = allTransactions.reduce<Record<string, number>>((acc, op) => {
    try {
      const dateStr = op.created_at || op.operation_date || '';
      const date = new Date(dateStr);
      
      // Only process if we have a valid date
      if (!isNaN(date.getTime())) {
        const formattedDate = date.toLocaleDateString();
        acc[formattedDate] = (acc[formattedDate] || 0) + 1;
      }
    } catch (error) {
      console.warn("Error formatting operation date:", op.created_at || op.operation_date);
    }
    return acc;
  }, {});

  // Calculate the total number of transactions
  const totalTransactions = Object.values(dailyTransactions).reduce<number>(
    (sum, count) => sum + (typeof count === 'number' ? count : 0), 
    0
  );
  
  const daysCount = Math.max(Object.keys(dailyTransactions).length, 1);
  
  // Ensure values are numbers before division
  const averageTransactionsPerDay = Number(totalTransactions) / Number(daysCount);
    
  return { averageTransactionsPerDay };
};

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
  
  if (!validStats || !validDeposits || !validWithdrawals || !validTransfers) {
    console.warn("Invalid statistics data detected:", {
      statsValid: validStats,
      depositsValid: validDeposits,
      withdrawalsValid: validWithdrawals,
      transfersValid: validTransfers
    });
  }
  
  return validStats && validDeposits && validWithdrawals && validTransfers;
};

export const ensureSafeStats = (stats: any) => {
  if (!stats || typeof stats !== 'object') {
    console.warn("Invalid stats object provided to ensureSafeStats", stats);
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
    total_deposits: Number(stats?.total_deposits) || 0,
    total_withdrawals: Number(stats?.total_withdrawals) || 0,
    client_count: Number(stats?.client_count) || 0,
    transfer_count: Number(stats?.transfer_count) || 0,
    total_balance: Number(stats?.total_balance) || 0,
    sent_transfers: Number(stats?.sent_transfers) || 0,
    received_transfers: Number(stats?.received_transfers) || 0,
    monthly_stats: Array.isArray(stats?.monthly_stats) ? stats.monthly_stats : []
  };
};
