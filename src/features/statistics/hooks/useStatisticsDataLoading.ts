
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useDeposits } from "@/features/deposits/hooks/useDeposits";
import { useWithdrawals } from "@/features/withdrawals/hooks/useWithdrawals";
import { useTransfersList } from "@/features/transfers/hooks/useTransfersList";
import { useDashboardData } from "@/features/dashboard/hooks/useDashboardData";

export const useStatisticsDataLoading = () => {
  const { deposits, isLoading: isLoadingDeposits } = useDeposits();
  const { withdrawals, isLoading: isLoadingWithdrawals } = useWithdrawals();
  const { transfers, isLoading: isLoadingTransfers } = useTransfersList();
  const { 
    stats, 
    isLoading: isLoadingStats, 
    handleRefresh, 
    error: dashboardError 
  } = useDashboardData();

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
    return Boolean(
      (Array.isArray(deposits) && deposits.length > 0) || 
      (Array.isArray(withdrawals) && withdrawals.length > 0) || 
      (stats && Object.keys(stats).length > 0)
    );
  }, [deposits, withdrawals, stats]);
  
  // Store data in cache when it's loaded
  useEffect(() => {
    if (!isLoadingDeposits && !isLoadingWithdrawals && !isLoadingStats && hasValidData()) {
      setCachedData({
        deposits: Array.isArray(deposits) ? [...deposits] : [],
        withdrawals: Array.isArray(withdrawals) ? [...withdrawals] : [],
        transfers: transfersArray,
        stats: stats ? { ...stats } : {},
        timestamp: Date.now()
      });
    }
  }, [isLoadingDeposits, isLoadingWithdrawals, isLoadingStats, deposits, withdrawals, transfersArray, stats, hasValidData]);

  useEffect(() => {
    // Reset timeout state when loading starts
    if (isLoadingStats || isLoadingDeposits || isLoadingWithdrawals || isLoadingTransfers) {
      setTimeoutExceeded(false);
      
      // Set a timeout to show a different state if loading takes too long
      const timeout = setTimeout(() => {
        if (isLoadingStats || isLoadingDeposits || isLoadingWithdrawals || isLoadingTransfers) {
          setTimeoutExceeded(true);
          
          // If we have cached data and loading takes too long, use the cached data
          if (cachedData && timeoutExceeded) {
            console.log("Using cached statistics data from", new Date(cachedData.timestamp).toLocaleTimeString());
          }
        }
      }, 8000); // Reduced from 15 seconds to 8 seconds for faster fallback
      
      return () => clearTimeout(timeout);
    }
  }, [isLoadingStats, isLoadingDeposits, isLoadingWithdrawals, isLoadingTransfers, manualRefreshAttempt, cachedData, timeoutExceeded]);

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
  const getDataToUse = () => {
    if (timeoutExceeded && cachedData && !hasValidData()) {
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
  };

  const dataToUse = getDataToUse();

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
