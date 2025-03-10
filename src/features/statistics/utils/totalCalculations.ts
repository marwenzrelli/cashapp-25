
import { safeNumber } from './safeConversion';

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
