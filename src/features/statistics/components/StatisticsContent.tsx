
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { FilterSection } from "./FilterSection";
import { StatisticsCards } from "./StatisticsCards";
import { ChartSection } from "./ChartSection";
import { InsightsSection } from "./InsightsSection";
import { TreasuryTab } from "./treasury/TreasuryTab";

interface StatisticsContentProps {
  stats: any;
  filteredDeposits: any[];
  filteredWithdrawals: any[];
  filteredTransfers: any[];
  percentageChange: number;
  averageTransactionsPerDay: number;
  last30DaysData: any[];
  topClients: any[];
  dateRange: any;
  setDateRange: (range: any) => void;
  clientFilter: string;
  setClientFilter: (filter: string) => void;
  transactionType: "all" | "deposits" | "withdrawals" | "transfers";
  setTransactionType: (type: "all" | "deposits" | "withdrawals" | "transfers") => void;
  treasuryOperations: any[];
  isLoading: boolean;
  hasValidData: boolean;
  attempted: boolean;
}

export const StatisticsContent = ({
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
  treasuryOperations,
  isLoading,
  hasValidData,
  attempted,
}: StatisticsContentProps) => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <Tabs 
      defaultValue="overview" 
      className="w-full space-y-8"
      value={activeTab}
      onValueChange={setActiveTab}
    >
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
                onClick={() => window.location.reload()}
                className="ml-2 text-primary hover:underline"
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
  );
};
