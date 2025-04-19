
import { LoadingState } from "@/features/admin/components/administration/LoadingState";
import { useStatisticsData } from "@/features/statistics/hooks/useStatisticsData";
import { StatisticsHeader } from "@/features/statistics/components/StatisticsHeader";
import { FilterSection } from "@/features/statistics/components/FilterSection";
import { StatisticsCards } from "@/features/statistics/components/StatisticsCards";
import { ChartSection } from "@/features/statistics/components/ChartSection";
import { InsightsSection } from "@/features/statistics/components/InsightsSection";
import { ErrorDisplay } from "@/features/statistics/components/ErrorDisplay";
import { TreasuryTab } from "@/features/statistics/components/treasury/TreasuryTab";
import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Operation } from "@/features/operations/types";

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
    timeoutExceeded,
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

  // Transform filtered data into Operation objects for the TreasuryTab
  const treasuryOperations = useMemo(() => {
    const mapDepositsToOperations = (deposits: any[]): Operation[] => {
      return deposits.map(deposit => ({
        id: deposit.id?.toString() || Math.random().toString(36).substr(2, 9),
        type: "deposit",
        amount: deposit.amount,
        date: deposit.operation_date || deposit.created_at,
        description: deposit.notes || "Versement",
        fromClient: deposit.client_name,
        status: deposit.status
      }));
    };

    const mapWithdrawalsToOperations = (withdrawals: any[]): Operation[] => {
      return withdrawals.map(withdrawal => ({
        id: withdrawal.id?.toString() || Math.random().toString(36).substr(2, 9),
        type: "withdrawal",
        amount: withdrawal.amount,
        date: withdrawal.operation_date || withdrawal.created_at,
        description: withdrawal.notes || "Retrait",
        fromClient: withdrawal.client_name,
        status: withdrawal.status
      }));
    };

    const mapTransfersToOperations = (transfers: any[]): Operation[] => {
      return transfers.map(transfer => ({
        id: transfer.id?.toString() || Math.random().toString(36).substr(2, 9),
        type: "transfer",
        amount: transfer.amount,
        date: transfer.operation_date || transfer.created_at,
        description: transfer.reason || "Virement",
        fromClient: transfer.fromClient,
        toClient: transfer.toClient,
        status: transfer.status
      }));
    };

    return [
      ...mapDepositsToOperations(Array.isArray(filteredDeposits) ? filteredDeposits : []),
      ...mapWithdrawalsToOperations(Array.isArray(filteredWithdrawals) ? filteredWithdrawals : []),
      ...mapTransfersToOperations(Array.isArray(filteredTransfers) ? filteredTransfers : [])
    ];
  }, [filteredDeposits, filteredWithdrawals, filteredTransfers]);

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

      <Tabs defaultValue="overview" className="w-full space-y-8">
        <TabsList>
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="treasury">Trésorerie</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8">
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
        </TabsContent>

        <TabsContent value="treasury">
          <TreasuryTab 
            operations={treasuryOperations} 
            isLoading={isLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Statistics;
