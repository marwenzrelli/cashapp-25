
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface StatisticsHeaderProps {
  isSyncing: boolean;
  isLoading: boolean;
  refreshData: () => void;
}

export const StatisticsHeader = ({ 
  isSyncing, 
  isLoading, 
  refreshData 
}: StatisticsHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold">Statistiques</h1>
        <p className="text-muted-foreground">
          Vue d'ensemble et analyses détaillées
        </p>
      </div>
      <Button 
        onClick={refreshData} 
        variant="outline" 
        className="flex items-center gap-2"
        disabled={isSyncing || isLoading}
      >
        <RefreshCw className={`h-4 w-4 ${isSyncing || isLoading ? 'animate-spin' : ''}`} />
        {isSyncing ? 'Synchronisation...' : 'Synchroniser'}
      </Button>
    </div>
  );
};
