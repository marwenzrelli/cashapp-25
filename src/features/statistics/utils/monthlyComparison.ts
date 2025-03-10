
import { safeNumber, isValidDate } from './safeConversion';
import { filterByDateRange } from './dateHelpers';

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
