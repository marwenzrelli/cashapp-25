
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
  const { stats, isLoading: isLoadingStats, handleRefresh, error: dashboardError } = useDashboardData();

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
  const [error, setError] = useState<string | null>(dashboardError);
  
  // Update local error state when dashboard error changes
  useEffect(() => {
    if (dashboardError) {
      setError(dashboardError);
    }
  }, [dashboardError]);
  
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
    setError(null);
    try {
      await handleRefresh();
      toast.success("Données synchronisées avec succès");
    } catch (error: any) {
      toast.error("Erreur lors de la synchronisation des données");
      setError(error?.message || "Erreur lors de la synchronisation des données");
      console.error("Error refreshing data:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  // Check if we have valid data before attempting to process it
  const hasValidData = 
    typeof stats === 'object' && 
    stats !== null && 
    Array.isArray(deposits) && 
    Array.isArray(withdrawals) && 
    Array.isArray(transfersArray);

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

  // Calculate statistics - handle potential null values
  const totalDeposits = filteredDeposits.reduce((acc, dep) => acc + (dep.amount || 0), 0);
  const totalWithdrawals = filteredWithdrawals.reduce((acc, withdrawal) => acc + (withdrawal.amount || 0), 0);
  const totalTransfers = filteredTransfers.reduce((acc, transfer) => acc + (transfer.amount || 0), 0);
  const netFlow = (stats?.total_deposits || 0) - (stats?.total_withdrawals || 0);

  // Month comparisons - only calculate if we have valid data
  let percentageChange = 0;
  let averageTransactionsPerDay = 0;
  
  if (hasValidData) {
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
    
    percentageChange = lastMonthTotal !== 0 
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

    averageTransactionsPerDay = Object.values(dailyTransactions).reduce((a, b) => a + b, 0) / 
      Math.max(Object.keys(dailyTransactions).length, 1);
  }

  // Chart data - only calculate if we have valid data
  const last30DaysData = hasValidData ? generateLast30DaysData(filteredDeposits, filteredWithdrawals, filteredTransfers) : [];

  // Client statistics - only calculate if we have valid deposits
  const clientStats = hasValidData && filteredDeposits.length > 0 ? generateClientStats(filteredDeposits) : {};
  const topClients = hasValidData ? getTopClients(clientStats) : [];

  // Improved data validation
  const dataIsValid = 
    hasValidData &&
    stats.total_deposits !== undefined &&
    stats.total_withdrawals !== undefined &&
    stats.client_count !== undefined &&
    !isLoadingStats &&
    !isLoadingDeposits &&
    !isLoadingWithdrawals &&
    !isLoadingTransfers;

  // Make sure stats is always a valid object
  const safeStats = {
    total_deposits: stats?.total_deposits || 0,
    total_withdrawals: stats?.total_withdrawals || 0,
    client_count: stats?.client_count || 0,
    transfer_count: stats?.transfer_count || 0,
    total_balance: stats?.total_balance || 0,
    sent_transfers: stats?.sent_transfers || 0,
    received_transfers: stats?.received_transfers || 0,
    monthly_stats: stats?.monthly_stats || []
  };

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
    isLoading: isLoadingDeposits || isLoadingWithdrawals || isLoadingTransfers || isLoadingStats,
    isSyncing,
    error,
    timeoutExceeded,
    dataIsValid,
    hasValidData,
    
    // Actions
    refreshData
  };
};
