
import { LoadingState } from "@/features/admin/components/administration/LoadingState";
import { useStatisticsData } from "@/features/statistics/hooks/useStatisticsData";
import { StatisticsHeader } from "@/features/statistics/components/StatisticsHeader";
import { FilterSection } from "@/features/statistics/components/FilterSection";
import { StatisticsCards } from "@/features/statistics/components/StatisticsCards";
import { ChartSection } from "@/features/statistics/components/ChartSection";
import { InsightsSection } from "@/features/statistics/components/InsightsSection";
import { ErrorDisplay } from "@/features/statistics/components/ErrorDisplay";

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
    
    // Actions
    refreshData
  } = useStatisticsData();

  // If data is still loading and we haven't attempted to show data yet
  if (isLoading && !attempted) {
    return (
      <div className="space-y-8">
        <StatisticsHeader 
          isSyncing={isSyncing} 
          isLoading={isLoading} 
          refreshData={refreshData} 
        />
        
        <LoadingState 
          message={timeoutExceeded ? 
            "Le chargement prend plus de temps que prévu... Veuillez patienter ou actualiser la page." : 
            "Chargement des statistiques en cours..."
          } 
          retrying={timeoutExceeded}
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
        />
        
        <ErrorDisplay 
          error={error} 
          refreshData={refreshData} 
          isSyncing={isSyncing} 
        />
      </div>
    );
  }

  // Fall back to showing the data even if it's not fully valid after the first loading
  return (
    <div className="space-y-8 animate-in">
      <StatisticsHeader 
        isSyncing={isSyncing} 
        isLoading={isLoading} 
        refreshData={refreshData} 
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
      ) : (
        <>
          <StatisticsCards
            totalDeposits={stats.total_deposits}
            totalWithdrawals={stats.total_withdrawals}
            sentTransfers={stats.sent_transfers}
            transferCount={stats.transfer_count}
            netFlow={stats.total_deposits - stats.total_withdrawals}
            clientCount={stats.client_count}
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
            totalDeposits={stats.total_deposits}
            depositsLength={Array.isArray(filteredDeposits) ? filteredDeposits.length : 0}
          />
        </>
      )}
    </div>
  );
};

export default Statistics;
