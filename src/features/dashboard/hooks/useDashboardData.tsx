
import { useState } from "react";
import { toast } from "sonner";
import { useStats } from "./useStats";
import { useRecentActivity } from "./useRecentActivity";
import { useRetry } from "./useRetry";
import { useAutoRefresh } from "./useAutoRefresh";

export const useDashboardData = () => {
  const { stats, isLoading: statsLoading, fetchStats } = useStats();
  const { 
    recentActivity, 
    isLoading: activityLoading, 
    retryCount,
    fetchRecentActivity,
    resetRetryCount
  } = useRecentActivity();

  // Initialize data on component mount
  useState(() => {
    fetchStats();
    fetchRecentActivity();
  });

  // Set up retry logic for recent activity
  useRetry(retryCount, 3, fetchRecentActivity);

  // Set up auto-refresh
  useAutoRefresh(() => {
    fetchStats();
    fetchRecentActivity();
  }, 30000);

  const handleRefresh = () => {
    fetchStats();
    resetRetryCount();
    fetchRecentActivity();
    toast.success("Statistiques actualisées");
  };

  return {
    stats,
    isLoading: statsLoading || activityLoading,
    recentActivity,
    handleRefresh
  };
};
