
import { Button } from "@/components/ui/button";
import { RefreshCw, Database } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect, useRef } from "react";

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
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleRefresh = () => {
    // Prevent multiple clicks
    if (isSyncing || buttonDisabled) return;
    
    setButtonDisabled(true);
    
    // Call the refresh function
    refreshData();
    
    // Disable button for 5 seconds to prevent spam
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
    }
    
    refreshTimerRef.current = setTimeout(() => {
      setButtonDisabled(false);
      refreshTimerRef.current = null;
    }, 5000); // 5-second cooldown
  };
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    };
  }, []);

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
        onClick={handleRefresh}
        variant="outline" 
        className="flex items-center gap-2"
        disabled={isSyncing || buttonDisabled || isLoading}
      >
        <RefreshCw className={`h-4 w-4 ${isSyncing || isLoading ? 'animate-spin' : ''}`} />
        {isSyncing ? 'Synchronisation...' : isLoading ? 'Chargement...' : 'Synchroniser'}
      </Button>
    </div>
  );
};
