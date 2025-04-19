
import { useStatisticsData } from "@/features/statistics/hooks/useStatisticsData";
import { StatisticsHeader } from "@/features/statistics/components/StatisticsHeader";
import { ErrorDisplay } from "@/features/statistics/components/ErrorDisplay";
import { StatisticsLoadingState } from "@/features/statistics/components/StatisticsLoadingState";
import { StatisticsContent } from "@/features/statistics/components/StatisticsContent";
import { useEffect, useMemo } from "react";
import { toast } from "sonner";
import { transformToOperations, deduplicateOperations, sortOperationsByDate } from "@/features/operations/hooks/utils/operationTransformers";

const Statistics = () => {
  const { 
    stats,
    filteredDeposits,
    filteredWithdrawals,
    filteredTransfers,
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
    isLoading,
    isSyncing,
    error,
    hasValidData,
    attempted,
    setAttempted,
    usingCachedData,
    refreshData
  } = useStatisticsData();

  useEffect(() => {
    const forceShowTimeout = setTimeout(() => {
      setAttempted(true);
    }, 2000);
    
    return () => clearTimeout(forceShowTimeout);
  }, [setAttempted]);

  useEffect(() => {
    if (usingCachedData) {
      toast.info("Affichage des données en cache pendant le chargement", {
        duration: 3000,
        position: "top-right"
      });
    }
  }, [usingCachedData]);

  const treasuryOperations = useMemo(() => {
    const deposits = Array.isArray(filteredDeposits) ? filteredDeposits : [];
    const withdrawals = Array.isArray(filteredWithdrawals) ? filteredWithdrawals : [];
    const transfers = Array.isArray(filteredTransfers) ? filteredTransfers : [];
    
    const transformedOperations = transformToOperations(deposits, withdrawals, transfers);
    const uniqueOperations = deduplicateOperations(transformedOperations);
    return sortOperationsByDate(uniqueOperations);
  }, [filteredDeposits, filteredWithdrawals, filteredTransfers]);

  if (isLoading && !attempted && !usingCachedData) {
    return (
      <StatisticsLoadingState 
        isSyncing={isSyncing}
        isLoading={isLoading}
        refreshData={refreshData}
        usingCachedData={usingCachedData}
      />
    );
  }

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

  return (
    <div className="space-y-8 animate-in">
      <StatisticsHeader 
        isSyncing={isSyncing} 
        isLoading={isLoading} 
        refreshData={refreshData}
        usingCachedData={usingCachedData}
      />

      <StatisticsContent
        stats={stats}
        filteredDeposits={filteredDeposits}
        filteredWithdrawals={filteredWithdrawals}
        filteredTransfers={filteredTransfers}
        percentageChange={percentageChange}
        averageTransactionsPerDay={averageTransactionsPerDay}
        last30DaysData={last30DaysData}
        topClients={topClients}
        dateRange={dateRange}
        setDateRange={setDateRange}
        clientFilter={clientFilter}
        setClientFilter={setClientFilter}
        transactionType={transactionType}
        setTransactionType={setTransactionType}
        treasuryOperations={treasuryOperations}
        isLoading={isLoading}
        hasValidData={hasValidData}
        attempted={attempted}
      />
    </div>
  );
};

export default Statistics;
