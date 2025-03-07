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

  // Always consider data valid to show UI even with partial data
  // This prevents the UI from getting stuck in loading state
  const hasValidData = true;

  // Processed data - filter out bad data before processing
  const filteredDeposits = filterData(
    Array.isArray(deposits) ? deposits : [], 
    "deposits",
    dateRange,
    clientFilter,
    transactionType
  );
  
  const filteredWithdrawals = filterData(
    Array.isArray(withdrawals) ? withdrawals : [], 
    "withdrawals",
    dateRange,
    clientFilter,
    transactionType
  );
  
  const filteredTransfers = filterData(
    Array.isArray(transfersArray) ? transfersArray.map(t => ({
      fromClient: t.fromClient,
      toClient: t.toClient,
      amount: t.amount,
      operation_date: t.date,
    })) : [],
    "transfers",
    dateRange,
    clientFilter,
    transactionType
  );

  // Calculate totals
  const { totalDeposits, totalWithdrawals, totalTransfers } = calculateTotals(
    filteredDeposits, 
    filteredWithdrawals, 
    filteredTransfers
  );
  
  // Make sure we have access to stats, even if it's empty
  const safeStats = ensureSafeStats(stats);
  const netFlow = safeStats.total_deposits - safeStats.total_withdrawals;

  // Calculate monthly comparisons and daily averages
  let percentageChange = 0;
  let averageTransactionsPerDay = 0;
  
  try {
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
  } catch (err) {
    console.error("Error calculating statistics:", err);
    // Keep default values
  }

  // Chart data - try to generate even with partial data
  let last30DaysData = [];
  try {
    last30DaysData = generateLast30DaysData(filteredDeposits, filteredWithdrawals, filteredTransfers);
  } catch (err) {
    console.error("Error generating chart data:", err);
    last30DaysData = [];
  }

  // Client statistics - generate if we have deposits
  let clientStats = {};
  try {
    if (filteredDeposits.length > 0) {
      clientStats = generateClientStats(filteredDeposits);
    }
  } catch (err) {
    console.error("Error generating client stats:", err);
    clientStats = {};
  }
    
  // Top clients - generate if we have client stats
  let topClients = [];
  try {
    topClients = getTopClients(clientStats);
  } catch (err) {
    console.error("Error generating top clients:", err);
    topClients = [];
  }

  // Check if data is completely valid (for UI purposes)
  const dataIsValid = !isLoading && stats && stats.total_deposits !== undefined;

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
    isLoading: isLoading && !attempted, // Force loading to end if we've already attempted
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
