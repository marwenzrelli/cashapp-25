
import { LoadingState } from "@/features/admin/components/administration/LoadingState";
import { useStatisticsData } from "@/features/statistics/hooks/useStatisticsData";
import { StatisticsHeader } from "@/features/statistics/components/StatisticsHeader";
import { FilterSection } from "@/features/statistics/components/FilterSection";
import { StatisticsCards } from "@/features/statistics/components/StatisticsCards";
import { ChartSection } from "@/features/statistics/components/ChartSection";
import { InsightsSection } from "@/features/statistics/components/InsightsSection";
import { ErrorDisplay } from "@/features/statistics/components/ErrorDisplay";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const Statistics = () => {
  const { 
    // Statistics data
    stats,
    filteredDeposits,
    
    // Calculated stats
    percentageChange,
    averageTransactionsPerDay,
    
    // Chart data
    last30DaysData,
    topClients,
    
    // Filters
    dateRange,
    setDateRange,
    clientFilter,
    setClientFilter,
    transactionType,
    setTransactionType,
    
    // Status
    isLoading,
    isSyncing,
    error,
    timeoutExceeded,
    hasValidData,
    attempted,
    setAttempted,
    usingCachedData,
    
    // Actions
    refreshData
  } = useStatisticsData();

  // Force show the data after just 2 seconds
  useEffect(() => {
    const forceShowTimeout = setTimeout(() => {
      setAttempted(true);
    }, 2000); // Significantly reduced from 6 seconds to 2 seconds
    
    return () => clearTimeout(forceShowTimeout);
  }, [setAttempted]);

  // Notify when using cached data
  useEffect(() => {
    if (usingCachedData) {
      toast.info("Affichage des données en cache pendant le chargement", {
        duration: 3000,
        position: "top-right"
      });
    }
  }, [usingCachedData]);

  // Show loading for maximum 2 seconds, then always show at least something
  if (isLoading && !attempted && !usingCachedData) {
    return (
      <div className="space-y-8">
        <StatisticsHeader 
          isSyncing={isSyncing} 
          isLoading={isLoading} 
          refreshData={refreshData}
          usingCachedData={usingCachedData}
        />
        
        <LoadingState 
          message="Chargement des statistiques en cours..."
          variant="minimal"
        />
      </div>
    );
  }

  // If there's an error
  if (error) {
    return (
      <div className="space-y-8">
        <StatisticsHeader 
          isSyncing={isSyncing} 
          isLoading={isLoading} 
          refreshData={refreshData}
          usingCachedData={usingCachedData}
        />
        
        <ErrorDisplay 
          error={error} 
          refreshData={refreshData} 
          isSyncing={isSyncing} 
        />
      </div>
    );
  }

  // Always show the data even if it's incomplete
  return (
    <div className="space-y-8 animate-in">
      <StatisticsHeader 
        isSyncing={isSyncing} 
        isLoading={isLoading} 
        refreshData={refreshData}
        usingCachedData={usingCachedData}
      />

      <FilterSection
        dateRange={dateRange}
        setDateRange={setDateRange}
        clientFilter={clientFilter}
        setClientFilter={setClientFilter}
        transactionType={transactionType}
        setTransactionType={setTransactionType}
      />

      {(!hasValidData && attempted) ? (
        <div className="p-6 rounded-lg border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 space-y-4">
          <p className="text-center text-muted-foreground">
            Certaines données n'ont pas pu être chargées correctement. 
            <button 
              onClick={refreshData} 
              className="ml-2 text-primary hover:underline"
              disabled={isSyncing || isLoading}
            >
              Réessayer
            </button>
          </p>
        </div>
      ) : null}
      
      <StatisticsCards
        totalDeposits={stats.total_deposits || 0}
        totalWithdrawals={stats.total_withdrawals || 0}
        sentTransfers={stats.sent_transfers || 0}
        transferCount={stats.transfer_count || 0}
        netFlow={(stats.total_deposits || 0) - (stats.total_withdrawals || 0)}
        clientCount={stats.client_count || 0}
        percentageChange={percentageChange}
        averageTransactionsPerDay={averageTransactionsPerDay}
      />

      <ChartSection
        last30DaysData={last30DaysData}
        topClients={topClients}
      />

      <InsightsSection
        percentageChange={percentageChange}
        averageTransactionsPerDay={averageTransactionsPerDay}
        totalDeposits={stats.total_deposits || 0}
        depositsLength={Array.isArray(filteredDeposits) ? filteredDeposits.length : 0}
      />
    </div>
  );
};

export default Statistics;
