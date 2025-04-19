
import { LoadingState } from "@/features/admin/components/administration/LoadingState";
import { StatisticsHeader } from "./StatisticsHeader";

interface StatisticsLoadingStateProps {
  isSyncing: boolean;
  isLoading: boolean;
  refreshData: () => void;
  usingCachedData: boolean;
}

export const StatisticsLoadingState = ({
  isSyncing,
  isLoading,
  refreshData,
  usingCachedData
}: StatisticsLoadingStateProps) => {
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
};
