
import { useState, useEffect } from "react";
import { DateRange } from "react-day-picker";
import { subDays } from "date-fns";
import { toast } from "sonner";
import { useDeposits } from "@/features/deposits/hooks/useDeposits";
import { useWithdrawals } from "@/features/withdrawals/hooks/useWithdrawals";
import { useTransfersList } from "@/features/transfers/hooks/useTransfersList";
import { useDashboardData } from "@/features/dashboard/hooks/useDashboardData";
import { filterData } from "../utils/dataFilters";
import { getMonthBoundaries, filterByDateRange, generateLast30DaysData } from "../utils/dateHelpers";
import { generateClientStats, getTopClients } from "../utils/clientStats";

export const useStatisticsData = () => {
  const { deposits, isLoading: isLoadingDeposits } = useDeposits();
  const { withdrawals, isLoading: isLoadingWithdrawals } = useWithdrawals();
  const { transfers, isLoading: isLoadingTransfers } = useTransfersList();
  const { stats, isLoading: isLoadingStats, handleRefresh, error } = useDashboardData();

  const transfersArray = Array.isArray(transfers) ? transfers : [];

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [clientFilter, setClientFilter] = useState("");
  const [transactionType, setTransactionType] = useState<"all" | "deposits" | "withdrawals" | "transfers">("all");
  const [isSyncing, setIsSyncing] = useState(false);
  const [timeoutExceeded, setTimeoutExceeded] = useState(false);
  const [manualRefreshAttempt, setManualRefreshAttempt] = useState(0);
  
  useEffect(() => {
    // Reset timeout state when loading starts
    if (isLoadingStats || isLoadingDeposits || isLoadingWithdrawals || isLoadingTransfers) {
      setTimeoutExceeded(false);
      
      // Set a timeout to show a different state if loading takes too long
      const timeout = setTimeout(() => {
        if (isLoadingStats || isLoadingDeposits || isLoadingWithdrawals || isLoadingTransfers) {
          setTimeoutExceeded(true);
        }
      }, 15000); // 15 seconds timeout
      
      return () => clearTimeout(timeout);
    }
  }, [isLoadingStats, isLoadingDeposits, isLoadingWithdrawals, isLoadingTransfers, manualRefreshAttempt]);

  const refreshData = async () => {
    setIsSyncing(true);
    setManualRefreshAttempt(prev => prev + 1);
    try {
      await handleRefresh();
      toast.success("Données synchronisées avec succès");
    } catch (error) {
      toast.error("Erreur lors de la synchronisation des données");
      console.error("Error refreshing data:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  // Processed data
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

  // Calculate statistics
  const totalDeposits = filteredDeposits.reduce((acc, dep) => acc + (dep.amount || 0), 0);
  const totalWithdrawals = filteredWithdrawals.reduce((acc, withdrawal) => acc + (withdrawal.amount || 0), 0);
  const totalTransfers = filteredTransfers.reduce((acc, transfer) => acc + (transfer.amount || 0), 0);
  const activeClients = new Set([
    ...filteredDeposits.map(dep => dep.client_name),
    ...filteredWithdrawals.map(w => w.client_name),
    ...filteredTransfers.map(transfer => transfer.fromClient),
    ...filteredTransfers.map(transfer => transfer.toClient)
  ].filter(Boolean)).size;
  const netFlow = stats.total_deposits - stats.total_withdrawals;

  // Month comparisons
  const { currentMonth, lastMonth } = getMonthBoundaries();
  
  const currentMonthDeposits = filterByDateRange(filteredDeposits, currentMonth.start, currentMonth.end);
  const currentMonthWithdrawals = filterByDateRange(filteredWithdrawals, currentMonth.start, currentMonth.end);
  const currentMonthTransfers = filterByDateRange(filteredTransfers, currentMonth.start, currentMonth.end);
  
  const lastMonthDeposits = filterByDateRange(filteredDeposits, lastMonth.start, lastMonth.end);
  const lastMonthWithdrawals = filterByDateRange(filteredWithdrawals, lastMonth.start, lastMonth.end);
  const lastMonthTransfers = filterByDateRange(filteredTransfers, lastMonth.start, lastMonth.end);

  const currentMonthTotal = currentMonthDeposits.reduce((acc, dep) => acc + dep.amount, 0) -
    currentMonthWithdrawals.reduce((acc, w) => acc + w.amount, 0) +
    currentMonthTransfers.reduce((acc, transfer) => acc + transfer.amount, 0);
  
  const lastMonthTotal = lastMonthDeposits.reduce((acc, dep) => acc + dep.amount, 0) -
    lastMonthWithdrawals.reduce((acc, w) => acc + w.amount, 0) +
    lastMonthTransfers.reduce((acc, transfer) => acc + transfer.amount, 0);
  
  const percentageChange = lastMonthTotal !== 0 
    ? ((currentMonthTotal - lastMonthTotal) / lastMonthTotal) * 100 
    : 0;

  // Daily transactions
  const dailyTransactions = [...filteredDeposits, ...filteredWithdrawals, ...filteredTransfers].reduce((acc, op) => {
    try {
      const date = new Date(op.created_at || op.operation_date || '').toLocaleDateString();
      acc[date] = (acc[date] || 0) + 1;
    } catch (error) {
      console.warn("Error formatting operation date:", op.created_at || op.operation_date);
    }
    return acc;
  }, {} as Record<string, number>);

  const averageTransactionsPerDay = Object.values(dailyTransactions).reduce((a, b) => a + b, 0) / 
    Math.max(Object.keys(dailyTransactions).length, 1);

  // Chart data
  const last30DaysData = generateLast30DaysData(filteredDeposits, filteredWithdrawals, filteredTransfers);

  // Client statistics
  const clientStats = generateClientStats(filteredDeposits);
  const topClients = getTopClients(clientStats);

  // Check if data is valid
  const dataIsValid = 
    stats.total_deposits !== undefined &&
    stats.total_withdrawals !== undefined &&
    stats.client_count !== undefined &&
    !isLoadingStats &&
    !isLoadingDeposits &&
    !isLoadingWithdrawals &&
    !isLoadingTransfers;

  return {
    // Original data
    stats,
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
    activeClients,
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
    isLoading: isLoadingDeposits || isLoadingWithdrawals || isLoadingTransfers || isLoadingStats,
    isSyncing,
    error,
    timeoutExceeded,
    dataIsValid,
    
    // Actions
    refreshData
  };
};
