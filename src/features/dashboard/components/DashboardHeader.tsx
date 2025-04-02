
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface DashboardHeaderProps {
  isLoading: boolean;
  onRefresh: () => void;
}

export const DashboardHeader = ({ isLoading, onRefresh }: DashboardHeaderProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Reset refresh state when isLoading changes
  useEffect(() => {
    if (!isLoading && isRefreshing) {
      setIsRefreshing(false);
    }
  }, [isLoading, isRefreshing]);

  const handleRefresh = () => {
    // Prevent multiple clicks
    if (isRefreshing || buttonDisabled) return;
    
    setIsRefreshing(true);
    setButtonDisabled(true);
    
    // Call the refresh function
    onRefresh();
    
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
    <div className="flex justify-between items-start">
      <div>
        <h1 className="text-3xl font-bold">Tableau de bord</h1>
        <p className="text-muted-foreground">
          Vue d'ensemble et analyses en temps réel
        </p>
      </div>
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          onClick={handleRefresh}
          disabled={isRefreshing || buttonDisabled || isLoading}
        >
          <RefreshCcw className={`h-4 w-4 ${(isRefreshing || isLoading) ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Actualisation...' : 'Actualiser'}
        </Button>
      </div>
    </div>
  );
};
