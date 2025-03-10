
import { useEffect } from "react";
import { toast } from "sonner";
import { useStatsData } from "./useStatsData";
import { useRecentActivity } from "./useRecentActivity";
import { SortOption } from "../types";

export const useDashboardData = () => {
  const {
    stats,
    isLoading,
    error,
    dataFetched,
    setDataFetched,
    fetchStats
  } = useStatsData();

  const {
    recentActivity,
    sortOption,
    fetchRecentActivity,
    handleSortChange
  } = useRecentActivity();

  const handleRefresh = () => {
    fetchStats();
    fetchRecentActivity();
    toast.success("Statistiques actualisées");
  };

  useEffect(() => {
    if (!dataFetched) {
      console.log("Initial data fetch");
      fetchStats();
      fetchRecentActivity();
      setDataFetched(true);
    }
    
    const interval = setInterval(() => {
      console.log("Auto-refreshing dashboard data");
      fetchStats();
      fetchRecentActivity();
    }, 10 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [dataFetched, fetchStats, fetchRecentActivity, setDataFetched]);

  return {
    stats,
    isLoading,
    error,
    recentActivity,
    handleRefresh,
    sortOption,
    handleSortChange
  };
};
