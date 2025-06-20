
import React from "react";
import { DashboardHeader } from "@/features/dashboard/components/DashboardHeader";
import { StatsCardGrid } from "@/features/dashboard/components/StatsCardGrid";
import { OperationTypeCards } from "@/features/dashboard/components/OperationTypeCards";
import { RecentActivityCard } from "@/features/dashboard/components/RecentActivity";
import { TransactionTrends } from "@/features/dashboard/components/TransactionTrends";
import { AISuggestions } from "@/features/dashboard/components/AISuggestions";
import { useDashboardData } from "@/features/dashboard/hooks/useDashboardData";
import { useCurrency } from "@/contexts/CurrencyContext";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { ScrollToTop } from "@/components/ui/scroll-to-top";

const Index = () => {
  const { 
    stats, 
    recentActivity, 
    isLoading, 
    error,
    handleRefresh 
  } = useDashboardData();
  
  const { currency } = useCurrency();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingIndicator 
          text="Chargement du tableau de bord..." 
          size="lg"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Erreur de chargement</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button 
            onClick={handleRefresh}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <DashboardHeader isLoading={isLoading} onRefresh={handleRefresh} />
      
      <StatsCardGrid stats={stats} currency={currency} />
      
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Types d'opérations</h3>
        <OperationTypeCards stats={stats} currency={currency} />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <RecentActivityCard activities={recentActivity} currency={currency} />
        </div>
        <AISuggestions stats={stats} />
      </div>
      
      <TransactionTrends data={stats.monthly_stats} currency={currency} />
      
      <ScrollToTop />
    </div>
  );
};

export default Index;
