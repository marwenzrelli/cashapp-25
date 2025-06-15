
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DashboardStats, RecentActivity } from "../types";

export const useDashboardData = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      console.log("Fetching dashboard stats...");
      
      // Simple stats query
      const { data: deposits, error: depositsError } = await supabase
        .from('deposits')
        .select('amount')
        .order('created_at', { ascending: false });

      if (depositsError) throw depositsError;

      const { data: withdrawals, error: withdrawalsError } = await supabase
        .from('withdrawals')
        .select('amount')
        .order('created_at', { ascending: false });

      if (withdrawalsError) throw withdrawalsError;

      const { data: clients, error: clientsError } = await supabase
        .from('clients')
        .select('id')
        .order('created_at', { ascending: false });

      if (clientsError) throw clientsError;

      // Calculate basic stats
      const totalDeposits = deposits?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0;
      const totalWithdrawals = withdrawals?.reduce((sum, w) => sum + (w.amount || 0), 0) || 0;
      const clientCount = clients?.length || 0;

      const dashboardStats: DashboardStats = {
        total_deposits: totalDeposits,
        total_withdrawals: totalWithdrawals,
        client_count: clientCount,
        transfer_count: 0,
        total_balance: totalDeposits - totalWithdrawals,
        sent_transfers: 0,
        received_transfers: 0,
        monthly_stats: []
      };

      setStats(dashboardStats);
      console.log("Dashboard stats loaded:", dashboardStats);

    } catch (error: any) {
      console.error("Error fetching dashboard stats:", error);
      setError(error?.message || "Erreur lors du chargement des statistiques");
    }
  }, []);

  const fetchRecentActivity = useCallback(async () => {
    try {
      console.log("Fetching recent activity...");
      
      // Get recent deposits
      const { data: recentDeposits, error: depositsError } = await supabase
        .from('deposits')
        .select('id, amount, client_name, created_at, status')
        .order('created_at', { ascending: false })
        .limit(5);

      if (depositsError) throw depositsError;

      // Get recent withdrawals
      const { data: recentWithdrawals, error: withdrawalsError } = await supabase
        .from('withdrawals')
        .select('id, amount, client_name, created_at, status')
        .order('created_at', { ascending: false })
        .limit(5);

      if (withdrawalsError) throw withdrawalsError;

      // Format activity data
      const activity: RecentActivity[] = [
        ...(recentDeposits || []).map(d => ({
          id: d.id.toString(),
          type: 'deposit' as const,
          amount: d.amount,
          date: d.created_at,
          client_name: d.client_name,
          status: d.status || 'completed'
        })),
        ...(recentWithdrawals || []).map(w => ({
          id: w.id.toString(),
          type: 'withdrawal' as const,
          amount: w.amount,
          date: w.created_at,
          client_name: w.client_name,
          status: w.status || 'completed'
        }))
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);

      setRecentActivity(activity);
      console.log("Recent activity loaded:", activity.length, "items");

    } catch (error: any) {
      console.error("Error fetching recent activity:", error);
      // Don't set error for activity, just log it
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        fetchStats(),
        fetchRecentActivity()
      ]);
      
      toast.success("Données actualisées");
    } catch (error: any) {
      console.error("Error refreshing dashboard:", error);
      setError(error?.message || "Erreur lors de l'actualisation");
      toast.error("Erreur lors de l'actualisation");
    } finally {
      setIsLoading(false);
    }
  }, [fetchStats, fetchRecentActivity]);

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchStats(),
        fetchRecentActivity()
      ]);
      setIsLoading(false);
    };

    loadData();
  }, [fetchStats, fetchRecentActivity]);

  return {
    stats,
    recentActivity,
    isLoading,
    error,
    handleRefresh
  };
};
