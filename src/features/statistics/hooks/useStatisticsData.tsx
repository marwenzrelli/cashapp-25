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

  const [attempted, setAttempted] = useState(false);
  
  useEffect(() => {
    if (isLoading) {
      const timeout = setTimeout(() => {
        setAttempted(true);
      }, 5000);
      
      return () => clearTimeout(timeout);
    }
  }, [isLoading]);
  
  useEffect(() => {
    if (!isLoading && !attempted) {
      setAttempted(true);
    }
  }, [isLoading, attempted]);

  const hasValidData = true;

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

  const { totalDeposits, totalWithdrawals, totalTransfers } = useMemo(() => 
    calculateTotals(filteredDeposits, filteredWithdrawals, filteredTransfers),
    [filteredDeposits, filteredWithdrawals, filteredTransfers]
  );
  
  const safeStats = useMemo(() => ensureSafeStats(stats), [stats]);
  const netFlow = safeStats.total_deposits - safeStats.total_withdrawals;

  const { percentageChange, averageTransactionsPerDay } = useMemo(() => {
    try {
      const monthBoundaries = getMonthBoundaries();
      
      const monthlyComparison = calculateMonthlyComparison(
        filteredDeposits,
        filteredWithdrawals, 
        filteredTransfers,
        monthBoundaries
      );
      
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

  const last30DaysData = useMemo(() => {
    try {
      return generateLast30DaysData(filteredDeposits, filteredWithdrawals, filteredTransfers);
    } catch (err) {
      console.error("Error generating chart data:", err);
      return [];
    }
  }, [filteredDeposits, filteredWithdrawals, filteredTransfers]);

  const topClients = useMemo(() => {
    try {
      console.log("Calculating top clients from all operations");
      
      // Combine all operations into a single array for client statistics
      const allOperations = [
        ...(Array.isArray(filteredDeposits) ? filteredDeposits : []),
        ...(Array.isArray(filteredWithdrawals) ? filteredWithdrawals : []),
        ...(Array.isArray(filteredTransfers) ? filteredTransfers : [])
      ];
      
      if (allOperations.length === 0) {
        console.warn("No operations available for top clients calculation");
        return [];
      }
      
      console.log(`Found ${allOperations.length} total operations for client statistics`);
      const clientStats = generateClientStats(allOperations);
      return getTopClients(clientStats);
    } catch (err) {
      console.error("Error generating top clients:", err);
      return [];
    }
  }, [filteredDeposits, filteredWithdrawals, filteredTransfers]);

  return {
    stats: safeStats,
    deposits,
    withdrawals,
    transfersArray,
    
    filteredDeposits,
    filteredWithdrawals,
    filteredTransfers,
    
    totalDeposits,
    totalWithdrawals,
    totalTransfers,
    netFlow,
    percentageChange,
    averageTransactionsPerDay,
    
    last30DaysData,
    topClients,
    
    dateRange,
    setDateRange,
    clientFilter,
    setClientFilter,
    transactionType,
    setTransactionType,
    
    isLoading: isLoading && !attempted,
    isSyncing,
    error,
    timeoutExceeded,
    dataIsValid: true,
    hasValidData,
    attempted,
    setAttempted,
    usingCachedData,
    
    refreshData
  };
};
