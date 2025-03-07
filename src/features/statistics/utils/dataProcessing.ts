
import { filterByDateRange } from "./dateHelpers";

/**
 * Safely converts a value to a number, returning 0 if conversion fails
 */
const safeNumber = (value: unknown): number => {
  if (value === null || value === undefined) return 0;
  const num = Number(value);
  return isNaN(num) ? 0 : num;
};

/**
 * Safely checks if a date is valid
 */
const isValidDate = (date: any): boolean => {
  if (!date) return false;
  const parsedDate = new Date(date);
  return !isNaN(parsedDate.getTime());
};

export const calculateTotals = (
  filteredDeposits: any[],
  filteredWithdrawals: any[],
  filteredTransfers: any[]
) => {
  // Ensure arrays are valid before processing
  const safeDeposits = Array.isArray(filteredDeposits) ? filteredDeposits : [];
  const safeWithdrawals = Array.isArray(filteredWithdrawals) ? filteredWithdrawals : [];
  const safeTransfers = Array.isArray(filteredTransfers) ? filteredTransfers : [];
  
  const totalDeposits = safeDeposits.reduce((acc, dep) => acc + safeNumber(dep?.amount), 0);
  const totalWithdrawals = safeWithdrawals.reduce((acc, withdrawal) => acc + safeNumber(withdrawal?.amount), 0);
  const totalTransfers = safeTransfers.reduce((acc, transfer) => acc + safeNumber(transfer?.amount), 0);
  
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
  
  // Ensure arrays are valid before processing
  const safeDeposits = Array.isArray(filteredDeposits) ? filteredDeposits : [];
  const safeWithdrawals = Array.isArray(filteredWithdrawals) ? filteredWithdrawals : [];
  const safeTransfers = Array.isArray(filteredTransfers) ? filteredTransfers : [];
  
  // Pre-filter to remove invalid dates
  const validDateDeposits = safeDeposits.filter(dep => 
    isValidDate(dep?.operation_date) || isValidDate(dep?.created_at)
  );
  
  const validDateWithdrawals = safeWithdrawals.filter(w => 
    isValidDate(w?.operation_date) || isValidDate(w?.created_at)
  );
  
  const validDateTransfers = safeTransfers.filter(t => 
    isValidDate(t?.operation_date) || isValidDate(t?.created_at)
  );
  
  const currentMonthDeposits = filterByDateRange(validDateDeposits, currentMonth.start, currentMonth.end);
  const currentMonthWithdrawals = filterByDateRange(validDateWithdrawals, currentMonth.start, currentMonth.end);
  const currentMonthTransfers = filterByDateRange(validDateTransfers, currentMonth.start, currentMonth.end);
  
  const lastMonthDeposits = filterByDateRange(validDateDeposits, lastMonth.start, lastMonth.end);
  const lastMonthWithdrawals = filterByDateRange(validDateWithdrawals, lastMonth.start, lastMonth.end);
  const lastMonthTransfers = filterByDateRange(validDateTransfers, lastMonth.start, lastMonth.end);

  // Calculate totals with safer number handling
  const currentMonthDepositsTotal = currentMonthDeposits.reduce((acc, dep) => acc + safeNumber(dep?.amount), 0);
  const currentMonthWithdrawalsTotal = currentMonthWithdrawals.reduce((acc, w) => acc + safeNumber(w?.amount), 0);
  const currentMonthTransfersTotal = currentMonthTransfers.reduce((acc, t) => acc + safeNumber(t?.amount), 0);
  
  const lastMonthDepositsTotal = lastMonthDeposits.reduce((acc, dep) => acc + safeNumber(dep?.amount), 0);
  const lastMonthWithdrawalsTotal = lastMonthWithdrawals.reduce((acc, w) => acc + safeNumber(w?.amount), 0);
  const lastMonthTransfersTotal = lastMonthTransfers.reduce((acc, t) => acc + safeNumber(t?.amount), 0);
  
  const currentMonthTotal = currentMonthDepositsTotal - currentMonthWithdrawalsTotal + currentMonthTransfersTotal;
  const lastMonthTotal = lastMonthDepositsTotal - lastMonthWithdrawalsTotal + lastMonthTransfersTotal;
  
  // Avoid division by zero
  const percentageChange = lastMonthTotal !== 0 
    ? ((currentMonthTotal - lastMonthTotal) / lastMonthTotal) * 100 
    : currentMonthTotal > 0 ? 100 : 0; // If last month was 0 but current month has value, show 100% increase

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
  
  // Pre-filter to remove elements with invalid dates
  const validDateDeposits = safeDeposits.filter(dep => 
    dep && (isValidDate(dep.created_at) || isValidDate(dep.operation_date))
  );
  
  const validDateWithdrawals = safeWithdrawals.filter(w => 
    w && (isValidDate(w.created_at) || isValidDate(w.operation_date))
  );
  
  const validDateTransfers = safeTransfers.filter(t => 
    t && (isValidDate(t.created_at) || isValidDate(t.operation_date))
  );
  
  // Combine all transactions with valid dates
  const allTransactions = [
    ...validDateDeposits,
    ...validDateWithdrawals, 
    ...validDateTransfers
  ];

  // Daily transactions with improved date handling
  const dailyTransactions = allTransactions.reduce<Record<string, number>>((acc, op) => {
    try {
      if (!op) return acc;
      
      const dateStr = op.created_at || op.operation_date || '';
      const date = new Date(dateStr);
      
      // Only process if we have a valid date
      if (!isNaN(date.getTime())) {
        const formattedDate = date.toLocaleDateString();
        acc[formattedDate] = (acc[formattedDate] || 0) + 1;
      }
    } catch (error) {
      // Silently handle errors without logging to reduce console noise
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
  const averageTransactionsPerDay = safeNumber(totalTransactions) / safeNumber(daysCount);
    
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
