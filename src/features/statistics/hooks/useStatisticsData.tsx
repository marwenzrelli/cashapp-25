
import { useState, useEffect, useMemo } from "react";
import { filterData } from "../utils/dataFilters";
import { getMonthBoundaries, generateLast30DaysData } from "../utils/dateHelpers";
import { generateClientStats, getTopClients } from "../utils/clientStats";
import { useStatisticsDataLoading } from "./useStatisticsDataLoading";
import { useStatisticsFilters } from "./useStatisticsFilters";
import { 
  calculateTotals, 
  calculateMonthlyComparison,
  calculateDailyTransactions,
  ensureSafeStats
} from "../utils/dataProcessing";

export const useStatisticsData = () => {
  const {
    deposits,
    withdrawals,
    transfersArray,
    stats,
    usingCachedData,
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
  
  // Force end loading state after 5 seconds (reduced from 8)
  useEffect(() => {
    if (isLoading) {
      const timeout = setTimeout(() => {
        setAttempted(true);
      }, 5000);
      
      return () => clearTimeout(timeout);
    }
  }, [isLoading]);
  
  useEffect(() => {
    // If we were loading and now we're not, mark as attempted
    if (!isLoading && !attempted) {
      setAttempted(true);
    }
  }, [isLoading, attempted]);

  // Always consider data valid to show UI even with partial data
  const hasValidData = true;

  // Memoize filtered data to avoid recalculations on each render
  const filteredDeposits = useMemo(() => filterData(
    Array.isArray(deposits) ? deposits : [], 
    "deposits",
    dateRange,
    clientFilter || "",
    transactionType
  ), [deposits, dateRange, clientFilter, transactionType]);
  
  const filteredWithdrawals = useMemo(() => filterData(
    Array.isArray(withdrawals) ? withdrawals : [], 
    "withdrawals",
    dateRange,
    clientFilter || "",
    transactionType
  ), [withdrawals, dateRange, clientFilter, transactionType]);
  
  const filteredTransfers = useMemo(() => filterData(
    Array.isArray(transfersArray) ? transfersArray.map(t => ({
      fromClient: t?.fromClient || "",
      toClient: t?.toClient || "",
      amount: t?.amount || 0,
      operation_date: t?.date || "",
    })) : [],
    "transfers",
    dateRange,
    clientFilter || "",
    transactionType
  ), [transfersArray, dateRange, clientFilter, transactionType]);

  // Memoize calculated totals
  const { totalDeposits, totalWithdrawals, totalTransfers } = useMemo(() => 
    calculateTotals(filteredDeposits, filteredWithdrawals, filteredTransfers),
    [filteredDeposits, filteredWithdrawals, filteredTransfers]
  );
  
  // Make sure we have access to stats, even if it's empty
  const safeStats = useMemo(() => ensureSafeStats(stats), [stats]);
  const netFlow = safeStats.total_deposits - safeStats.total_withdrawals;

  // Memoize percentage change and daily average calculations
  const { percentageChange, averageTransactionsPerDay } = useMemo(() => {
    try {
      const monthBoundaries = getMonthBoundaries();
      
      // Get percentage change from monthly comparison
      const monthlyComparison = calculateMonthlyComparison(
        filteredDeposits,
        filteredWithdrawals, 
        filteredTransfers,
        monthBoundaries
      );
      
      // Get average transactions per day
      const dailyStats = calculateDailyTransactions(
        filteredDeposits,
        filteredWithdrawals,
        filteredTransfers
      );
      
      return {
        percentageChange: isNaN(monthlyComparison.percentageChange) ? 0 : monthlyComparison.percentageChange,
        averageTransactionsPerDay: isNaN(dailyStats.averageTransactionsPerDay) ? 0 : dailyStats.averageTransactionsPerDay
      };
    } catch (err) {
      console.error("Error calculating statistics:", err);
      return { percentageChange: 0, averageTransactionsPerDay: 0 };
    }
  }, [filteredDeposits, filteredWithdrawals, filteredTransfers]);

  // Memoize chart data generation
  const last30DaysData = useMemo(() => {
    try {
      return generateLast30DaysData(filteredDeposits, filteredWithdrawals, filteredTransfers);
    } catch (err) {
      console.error("Error generating chart data:", err);
      return [];
    }
  }, [filteredDeposits, filteredWithdrawals, filteredTransfers]);

  // Memoize top clients calculations
  const topClients = useMemo(() => {
    try {
      // Client statistics - generate if we have deposits
      if (filteredDeposits.length > 0) {
        const clientStats = generateClientStats(filteredDeposits);
        return getTopClients(clientStats);
      }
      return [];
    } catch (err) {
      console.error("Error generating top clients:", err);
      return [];
    }
  }, [filteredDeposits]);

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
    isLoading: isLoading && !attempted, // Force loading to end after timeout
    isSyncing,
    error,
    timeoutExceeded,
    dataIsValid: true,
    hasValidData,
    attempted,
    setAttempted,
    usingCachedData,
    
    // Actions
    refreshData
  };
};
