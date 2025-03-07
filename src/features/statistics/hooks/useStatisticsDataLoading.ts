
import { useState, useEffect } from "react";
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

  return {
    // Raw data
    deposits,
    withdrawals,
    transfersArray,
    stats,
    
    // Loading states
    isLoading: isLoadingDeposits || isLoadingWithdrawals || isLoadingTransfers || isLoadingStats,
    isSyncing,
    error,
    timeoutExceeded,
    
    // Actions
    refreshData,
  };
};
