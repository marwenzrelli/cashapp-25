
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DashboardStats, RecentActivity } from "../types";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";

export const useDashboardData = () => {
  const [stats, setStats] = useState<DashboardStats>({
    total_deposits: 0,
    total_withdrawals: 0,
    client_count: 0,
    transfer_count: 0,
    total_balance: 0,
    sent_transfers: 0,
    received_transfers: 0,
    monthly_stats: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [dataFetched, setDataFetched] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const generateMonthlyStats = async () => {
    try {
      console.log("Generating monthly stats...");
      const today = new Date();
      const monthlyData = [];

      for (let i = 0; i < 12; i++) {
        const month = subMonths(today, i);
        const monthStart = startOfMonth(month);
        const monthEnd = endOfMonth(month);
        
        const monthLabel = format(month, 'MMM');
        const startStr = monthStart.toISOString();
        const endStr = monthEnd.toISOString();
        
        const { data: monthDeposits, error: depositsError } = await supabase
          .from('deposits')
          .select('amount')
          .gte('created_at', startStr)
          .lte('created_at', endStr)
          .eq('status', 'completed');
          
        if (depositsError) {
          console.error("Error fetching month deposits:", depositsError);
          throw depositsError;
        }
        
        const { data: monthWithdrawals, error: withdrawalsError } = await supabase
          .from('withdrawals')
          .select('amount')
          .gte('created_at', startStr)
          .lte('created_at', endStr)
          .eq('status', 'completed');
          
        if (withdrawalsError) {
          console.error("Error fetching month withdrawals:", withdrawalsError);
          throw withdrawalsError;
        }
        
        const total_deposits = monthDeposits?.reduce((sum, d) => sum + parseFloat(d.amount.toString()), 0) || 0;
        const total_withdrawals = monthWithdrawals?.reduce((sum, w) => sum + parseFloat(w.amount.toString()), 0) || 0;
        
        monthlyData.unshift({
          day: monthLabel,
          total_deposits,
          total_withdrawals,
          deposits_count: monthDeposits?.length || 0,
          withdrawals_count: monthWithdrawals?.length || 0
        });
      }
      
      console.log("Monthly stats generated:", monthlyData.length, "months");
      return monthlyData;
    } catch (error) {
      console.error("Error generating monthly stats:", error);
      return [];
    }
  };

  const testConnection = async () => {
    try {
      console.log("Testing Supabase connection...");
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Session error:", sessionError);
        return false;
      }
      
      if (!session) {
        console.error("No active session found");
        return false;
      }
      
      console.log("Session found for user:", session.user.id);
      
      // Test simple query
      const { data, error } = await supabase
        .from('clients')
        .select('id')
        .limit(1);
        
      if (error) {
        console.error("Database connection test failed:", error);
        return false;
      }
      
      console.log("Database connection successful");
      return true;
    } catch (error) {
      console.error("Connection test failed:", error);
      return false;
    }
  };

  const fetchStats = useCallback(async (isRetry = false) => {
    console.log("Starting fetchStats, retry:", isRetry, "retryCount:", retryCount);
    
    if (isRetry) {
      setRetryCount(prev => prev + 1);
    }
    
    try {
      if (!isRetry) setIsLoading(true);
      setError(null);
      
      // Test connection first
      const connectionOk = await testConnection();
      if (!connectionOk) {
        throw new Error("Impossible de se connecter à la base de données");
      }
      
      console.log("Fetching deposits...");
      const { data: deposits, error: depositsError } = await supabase
        .from('deposits')
        .select('amount')
        .eq('status', 'completed');

      if (depositsError) {
        console.error("Deposits error:", depositsError);
        throw depositsError;
      }
      console.log("Deposits fetched:", deposits?.length || 0);

      console.log("Fetching withdrawals...");
      const { data: withdrawals, error: withdrawalsError } = await supabase
        .from('withdrawals')
        .select('amount')
        .eq('status', 'completed');

      if (withdrawalsError) {
        console.error("Withdrawals error:", withdrawalsError);
        throw withdrawalsError;
      }
      console.log("Withdrawals fetched:", withdrawals?.length || 0);

      console.log("Fetching client count...");
      const { count: clientCount, error: clientsError } = await supabase
        .from('clients')
        .select('*', { count: 'exact' })
        .eq('status', 'active');

      if (clientsError) {
        console.error("Clients error:", clientsError);
        throw clientsError;
      }
      console.log("Client count:", clientCount);

      console.log("Generating monthly stats...");
      const monthlyStats = await generateMonthlyStats();

      console.log("Fetching clients data for balance...");
      const { data: clientsData, error: clientsDataError } = await supabase
        .from('clients')
        .select('id, solde, status');

      if (clientsDataError) {
        console.error("Clients data error:", clientsDataError);
        throw clientsDataError;
      }
      console.log("Clients data fetched:", clientsData?.length || 0);

      const total_balance = clientsData
        ?.filter(client => client.status === 'active')
        ?.reduce((sum, client) => {
          const clientBalance = parseFloat(client.solde?.toString() || '0');
          return sum + clientBalance;
        }, 0) || 0;

      console.log("Fetching transfers...");
      const { data: transfers, error: transfersError } = await supabase
        .from('transfers')
        .select('amount, from_client, to_client')
        .eq('status', 'completed');

      if (transfersError) {
        console.error("Transfers error:", transfersError);
        throw transfersError;
      }
      console.log("Transfers fetched:", transfers?.length || 0);

      const total_deposits = deposits?.reduce((sum, d) => sum + parseFloat(d.amount.toString()), 0) || 0;
      const total_withdrawals = withdrawals?.reduce((sum, w) => sum + parseFloat(w.amount.toString()), 0) || 0;
      const sent_transfers = transfers?.reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0) || 0;
      const received_transfers = transfers?.reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0) || 0;
      const transfer_count = transfers?.length || 0;

      console.log("Final stats calculated:", {
        total_deposits,
        total_withdrawals,
        client_count: clientCount,
        transfer_count,
        total_balance,
        sent_transfers,
        received_transfers
      });

      setStats({
        total_deposits,
        total_withdrawals,
        client_count: clientCount || 0,
        transfer_count,
        monthly_stats: monthlyStats,
        total_balance,
        sent_transfers,
        received_transfers
      });
      
      setDataFetched(true);
      setRetryCount(0);
      console.log("Stats successfully updated");
    } catch (error: any) {
      console.error('Error fetching stats:', error);
      const errorMessage = error.message || "Erreur lors du chargement des statistiques";
      setError(errorMessage);
      
      if (retryCount < 3 && !isRetry) {
        console.log(`Auto-retrying fetch attempt ${retryCount + 1}/3`);
        setTimeout(() => fetchStats(true), 3000);
      } else {
        console.log("Max retries reached or manual retry");
        toast.error("Erreur lors du chargement des statistiques", {
          description: errorMessage
        });
        setStats({
          total_deposits: 0,
          total_withdrawals: 0,
          client_count: 0,
          transfer_count: 0,
          total_balance: 0,
          sent_transfers: 0,
          received_transfers: 0,
          monthly_stats: []
        });
        setDataFetched(true);
      }
    } finally {
      setIsLoading(false);
    }
  }, [retryCount]);

  const fetchRecentActivity = useCallback(async () => {
    try {
      console.log("Fetching recent activity...");
      
      const { data: recentDeposits, error: depositsError } = await supabase
        .from('deposits')
        .select('id, amount, created_at, client_name, status, notes')
        .order('created_at', { ascending: false })
        .limit(20);

      if (depositsError) {
        console.error("Recent deposits error:", depositsError);
        throw depositsError;
      }

      const { data: recentWithdrawals, error: withdrawalsError } = await supabase
        .from('withdrawals')
        .select('id, amount, created_at, client_name, status, notes')
        .order('created_at', { ascending: false })
        .limit(20);

      if (withdrawalsError) {
        console.error("Recent withdrawals error:", withdrawalsError);
        throw withdrawalsError;
      }

      const { data: recentTransfers, error: transfersError } = await supabase
        .from('transfers')
        .select('id, amount, created_at, from_client, to_client, status, reason')
        .order('created_at', { ascending: false })
        .limit(20);

      if (transfersError) {
        console.error("Recent transfers error:", transfersError);
        throw transfersError;
      }

      console.log("Raw activity data fetched:", { 
        deposits: recentDeposits?.length, 
        withdrawals: recentWithdrawals?.length, 
        transfers: recentTransfers?.length 
      });

      const deposits = recentDeposits || [];
      const withdrawals = recentWithdrawals || [];
      const transfers = recentTransfers || [];

      const allActivity = [
        ...deposits.map(d => ({
          id: d.id.toString(),
          type: 'deposit' as const,
          amount: d.amount,
          date: d.created_at,
          client_name: d.client_name,
          fromClient: d.client_name,
          status: d.status,
          description: d.notes || `Versement pour ${d.client_name}`
        })),
        ...withdrawals.map(w => ({
          id: w.id.toString(),
          type: 'withdrawal' as const,
          amount: w.amount,
          date: w.created_at,
          client_name: w.client_name,
          fromClient: w.client_name,
          status: w.status,
          description: w.notes || `Retrait par ${w.client_name}`
        })),
        ...transfers.map(t => ({
          id: t.id.toString(),
          type: 'transfer' as const,
          amount: t.amount,
          date: t.created_at,
          client_name: `${t.from_client} → ${t.to_client}`,
          fromClient: t.from_client,
          toClient: t.to_client,
          status: t.status,
          description: t.reason || `Virement de ${t.from_client} vers ${t.to_client}`
        }))
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
       .slice(0, 30);

      console.log("Formatted activities:", allActivity.length);
      setRecentActivity(allActivity);
    } catch (error: any) {
      console.error('Error fetching recent activity:', error);
      toast.error("Erreur lors du chargement de l'activité récente");
      setRecentActivity([]);
    }
  }, []);

  const handleRefresh = () => {
    console.log("Manual refresh triggered");
    setIsLoading(true);
    setError(null);
    setRetryCount(0);
    fetchStats();
    fetchRecentActivity();
    toast.success("Statistiques actualisées");
  };

  useEffect(() => {
    if (!dataFetched) {
      console.log("Initial data fetch starting...");
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
  }, [dataFetched, fetchStats, fetchRecentActivity]);

  return {
    stats,
    isLoading,
    error,
    recentActivity,
    handleRefresh
  };
};
