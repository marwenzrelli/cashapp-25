
import { safeNumber, isValidDate } from './safeConversion';

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
