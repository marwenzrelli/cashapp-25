
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useDeposits } from "@/features/deposits/hooks/useDeposits";
import { useWithdrawals } from "@/features/withdrawals/hooks/useWithdrawals";
import { useTransfersList } from "@/features/transfers/hooks/useTransfersList";
import { useDashboardData } from "@/features/dashboard/hooks/useDashboardData";

export const useStatisticsDataLoading = () => {
  // Initialize these hooks separately to avoid React queue errors
  const depositsData = useDeposits();
  const withdrawalsData = useWithdrawals();
  const transfersData = useTransfersList();
  const dashboardData = useDashboardData();
  
  // Extract data from hooks
  const { deposits, isLoading: isLoadingDeposits } = depositsData;
  const { withdrawals, isLoading: isLoadingWithdrawals } = withdrawalsData;
  const { transfers, isLoading: isLoadingTransfers } = transfersData;
  const { stats, isLoading: isLoadingStats, handleRefresh, error: dashboardError } = dashboardData;

  const transfersArray = Array.isArray(transfers) ? transfers : [];

  const [isSyncing, setIsSyncing] = useState(false);
  const [timeoutExceeded, setTimeoutExceeded] = useState(false);
  const [manualRefreshAttempt, setManualRefreshAttempt] = useState(0);
  const [error, setError] = useState<string | null>(dashboardError);
  const [cachedData, setCachedData] = useState<{
    deposits: any[];
    withdrawals: any[];
    transfers: any[];
    stats: any;
    timestamp: number;
  } | null>(null);
  
  // Update local error state when dashboard error changes
  useEffect(() => {
    if (dashboardError) {
      setError(dashboardError);
    }
  }, [dashboardError]);
  
  // Check if we have valid data loaded
  const hasValidData = useCallback(() => {
    // Consider any non-empty data as valid to show something to the user faster
    return Boolean(
      (Array.isArray(deposits) && deposits.length > 0) || 
      (Array.isArray(withdrawals) && withdrawals.length > 0) || 
      (stats && Object.keys(stats).length > 0)
    );
  }, [deposits, withdrawals, stats]);
  
  // Store data in cache immediately when any data is loaded
  useEffect(() => {
    // Store in cache as soon as any data becomes available
    if ((!isLoadingDeposits || !isLoadingWithdrawals || !isLoadingStats) && 
        (Array.isArray(deposits) || Array.isArray(withdrawals) || stats)) {
      setCachedData({
        deposits: Array.isArray(deposits) ? [...deposits] : [],
        withdrawals: Array.isArray(withdrawals) ? [...withdrawals] : [],
        transfers: transfersArray,
        stats: stats ? { ...stats } : {},
        timestamp: Date.now()
      });
    }
  }, [isLoadingDeposits, isLoadingWithdrawals, isLoadingStats, deposits, withdrawals, transfersArray, stats]);

  useEffect(() => {
    // Set timeout much faster - show cached data sooner
    if (isLoadingStats || isLoadingDeposits || isLoadingWithdrawals || isLoadingTransfers) {
      setTimeoutExceeded(false);
      
      // Set a timeout to show a different state if loading takes too long
      const timeout = setTimeout(() => {
        if (isLoadingStats || isLoadingDeposits || isLoadingWithdrawals || isLoadingTransfers) {
          setTimeoutExceeded(true);
          
          // Let user know we're using cached data
          if (cachedData && !hasValidData()) {
            console.log("Using cached statistics data from", new Date(cachedData.timestamp).toLocaleTimeString());
            // No toast here - we'll handle it in the component
          }
        }
      }, 3000); // Reduced to 3 seconds for faster fallback to cache
      
      return () => clearTimeout(timeout);
    }
  }, [isLoadingStats, isLoadingDeposits, isLoadingWithdrawals, isLoadingTransfers, manualRefreshAttempt, cachedData, hasValidData]);

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

  // Return cached data if loading is taking too long and we have cached data
  const getDataToUse = useCallback(() => {
    // Always use cache if it exists and we're still loading
    if (cachedData && (isLoadingStats || isLoadingDeposits || isLoadingWithdrawals || timeoutExceeded)) {
      return {
        deposits: cachedData.deposits,
        withdrawals: cachedData.withdrawals,
        transfersArray: cachedData.transfers,
        stats: cachedData.stats,
        usingCachedData: true
      };
    }
    
    return {
      deposits,
      withdrawals,
      transfersArray,
      stats,
      usingCachedData: false
    };
  }, [deposits, withdrawals, transfersArray, stats, cachedData, isLoadingStats, isLoadingDeposits, isLoadingWithdrawals, timeoutExceeded]);

  const dataToUse = getDataToUse();

  // Add debug logging to diagnose the issue
  console.log("Statistics data loading:", {
    depositsCount: Array.isArray(dataToUse.deposits) ? dataToUse.deposits.length : 0,
    withdrawalsCount: Array.isArray(dataToUse.withdrawals) ? dataToUse.withdrawals.length : 0,
    transfersCount: Array.isArray(dataToUse.transfersArray) ? dataToUse.transfersArray.length : 0,
    usingCache: dataToUse.usingCachedData
  });

  return {
    // Raw data
    deposits: dataToUse.deposits,
    withdrawals: dataToUse.withdrawals,
    transfersArray: dataToUse.transfersArray,
    stats: dataToUse.stats,
    usingCachedData: dataToUse.usingCachedData,
    
    // Loading states
    isLoading: isLoadingDeposits || isLoadingWithdrawals || isLoadingTransfers || isLoadingStats,
    isSyncing,
    error,
    timeoutExceeded,
    
    // Actions
    refreshData,
  };
};
