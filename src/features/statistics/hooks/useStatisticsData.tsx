
import { useState, useEffect } from "react";
import { filterData } from "../utils/dataFilters";
import { getMonthBoundaries, generateLast30DaysData } from "../utils/dateHelpers";
import { generateClientStats, getTopClients } from "../utils/clientStats";
import { useStatisticsDataLoading } from "./useStatisticsDataLoading";
import { useStatisticsFilters } from "./useStatisticsFilters";
import { 
  calculateTotals, 
  calculateMonthlyComparison,
  calculateDailyTransactions,
  validateStatisticsData,
  ensureSafeStats
} from "../utils/dataProcessing";

export const useStatisticsData = () => {
  const {
    deposits,
    withdrawals,
    transfersArray,
    stats,
    isLoading,
    isSyncing,
    error,
    timeoutExceeded,
    refreshData,
  } = useStatisticsDataLoading();

  const {
    dateRange,
    setDateRange,
    clientFilter,
    setClientFilter,
    transactionType,
    setTransactionType,
  } = useStatisticsFilters();

  // Track if we've attempted to show data
  const [attempted, setAttempted] = useState(false);
  
  useEffect(() => {
    // If we were loading and now we're not, mark as attempted
    if (!isLoading && !attempted) {
      setAttempted(true);
    }
  }, [isLoading, attempted]);

  // Check if we have valid data before attempting to process it
  const hasValidData = validateStatisticsData(stats, deposits, withdrawals, transfersArray);

  // Processed data - only calculate if we have valid data
  const filteredDeposits = hasValidData ? filterData(
    deposits, 
    "deposits",
    dateRange,
    clientFilter,
    transactionType
  ) : [];
  
  const filteredWithdrawals = hasValidData ? filterData(
    withdrawals, 
    "withdrawals",
    dateRange,
    clientFilter,
    transactionType
  ) : [];
  
  const filteredTransfers = hasValidData ? filterData(
    transfersArray.map(t => ({
      fromClient: t.fromClient,
      toClient: t.toClient,
      amount: t.amount,
      operation_date: t.date,
    })),
    "transfers",
    dateRange,
    clientFilter,
    transactionType
  ) : [];

  // Calculate totals
  const { totalDeposits, totalWithdrawals, totalTransfers } = calculateTotals(
    filteredDeposits, 
    filteredWithdrawals, 
    filteredTransfers
  );
  
  const netFlow = (stats?.total_deposits || 0) - (stats?.total_withdrawals || 0);

  // Calculate monthly comparisons and daily averages
  let percentageChange = 0;
  let averageTransactionsPerDay = 0;
  
  if (hasValidData) {
    const monthBoundaries = getMonthBoundaries();
    
    // Get percentage change from monthly comparison
    const monthlyComparison = calculateMonthlyComparison(
      filteredDeposits,
      filteredWithdrawals, 
      filteredTransfers,
      monthBoundaries
    );
    percentageChange = monthlyComparison.percentageChange;
    
    // Get average transactions per day
    const dailyStats = calculateDailyTransactions(
      filteredDeposits,
      filteredWithdrawals,
      filteredTransfers
    );
    averageTransactionsPerDay = dailyStats.averageTransactionsPerDay;
  }

  // Chart data - only calculate if we have valid data
  const last30DaysData = hasValidData 
    ? generateLast30DaysData(filteredDeposits, filteredWithdrawals, filteredTransfers) 
    : [];

  // Client statistics - only calculate if we have valid deposits
  const clientStats = hasValidData && filteredDeposits.length > 0 
    ? generateClientStats(filteredDeposits) 
    : {};
    
  const topClients = hasValidData ? getTopClients(clientStats) : [];

  // Improved data validation
  const dataIsValid = 
    hasValidData &&
    stats.total_deposits !== undefined &&
    stats.total_withdrawals !== undefined &&
    stats.client_count !== undefined &&
    !isLoading;

  // Make sure stats is always a valid object
  const safeStats = ensureSafeStats(stats);

  return {
    // Original data
    stats: safeStats,
    deposits,
    withdrawals,
    transfersArray,
    
    // Filtered data
    filteredDeposits,
    filteredWithdrawals,
    filteredTransfers,
    
    // Calculated statistics
    totalDeposits,
    totalWithdrawals,
    totalTransfers,
    netFlow,
    percentageChange,
    averageTransactionsPerDay,
    
    // Chart data
    last30DaysData,
    topClients,
    
    // State and filters
    dateRange,
    setDateRange,
    clientFilter,
    setClientFilter,
    transactionType,
    setTransactionType,
    
    // Loading and error states
    isLoading,
    isSyncing,
    error,
    timeoutExceeded,
    dataIsValid,
    hasValidData,
    attempted,
    setAttempted,
    
    // Actions
    refreshData
  };
};
