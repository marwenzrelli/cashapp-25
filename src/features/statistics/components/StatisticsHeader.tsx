
import { Button } from "@/components/ui/button";
import { RefreshCw, Database } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface StatisticsHeaderProps {
  isSyncing: boolean;
  isLoading: boolean;
  refreshData: () => void;
  usingCachedData?: boolean;
}

export const StatisticsHeader = ({ 
  isSyncing, 
  isLoading, 
  refreshData,
  usingCachedData = false
}: StatisticsHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold">Statistiques</h1>
        <p className="text-muted-foreground flex items-center gap-1">
          Vue d'ensemble et analyses détaillées
          {usingCachedData && (
            <span className="ml-2 text-yellow-600 dark:text-yellow-400 text-sm flex items-center gap-1">
              <Database className="h-3 w-3" /> Données en cache
            </span>
          )}
        </p>
      </div>
      <Button 
        onClick={refreshData} 
        variant="outline" 
        className="flex items-center gap-2"
        disabled={isSyncing}
      >
        <RefreshCw className={`h-4 w-4 ${isSyncing || isLoading ? 'animate-spin' : ''}`} />
        {isSyncing ? 'Synchronisation...' : isLoading ? 'Chargement...' : 'Synchroniser'}
      </Button>
    </div>
  );
};
