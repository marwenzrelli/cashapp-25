
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DashboardStats, RecentActivity } from "../types";

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

  const fetchStats = async () => {
    try {
      console.log("Dashboard: Fetching stats...");
      setIsLoading(true);
      setError(null);
      
      // Vérifier que la connexion Supabase est disponible
      if (!supabase) {
        throw new Error("La connexion Supabase n'est pas disponible");
      }
      
      const { data: deposits, error: depositsError } = await supabase
        .from('deposits')
        .select('amount')
        .eq('status', 'completed');

      if (depositsError) {
        console.error("Error fetching deposits:", depositsError);
        throw depositsError;
      }

      console.log(`Dashboard: Found ${deposits?.length || 0} deposits`);

      const { data: withdrawals, error: withdrawalsError } = await supabase
        .from('withdrawals')
        .select('amount')
        .eq('status', 'completed');

      if (withdrawalsError) {
        console.error("Error fetching withdrawals:", withdrawalsError);
        throw withdrawalsError;
      }

      console.log(`Dashboard: Found ${withdrawals?.length || 0} withdrawals`);

      const { count: clientCount, error: clientsError } = await supabase
        .from('clients')
        .select('*', { count: 'exact' })
        .eq('status', 'active');

      if (clientsError) {
        console.error("Error fetching clients:", clientsError);
        throw clientsError;
      }

      console.log(`Dashboard: Found ${clientCount || 0} clients`);

      const { data: monthlyStats, error: statsError } = await supabase
        .from('operation_statistics')
        .select('*')
        .order('day', { ascending: true })
        .limit(12);

      if (statsError) {
        console.error("Error fetching monthly stats:", statsError);
        throw statsError;
      }

      console.log(`Dashboard: Found ${monthlyStats?.length || 0} monthly stat entries`);

      const { data: balanceData, error: balanceError } = await supabase
        .from('clients')
        .select('solde')
        .eq('status', 'active');

      if (balanceError) {
        console.error("Error fetching client balances:", balanceError);
        throw balanceError;
      }

      console.log(`Dashboard: Found ${balanceData?.length || 0} client balances`);

      const { data: transfers, error: transfersError } = await supabase
        .from('transfers')
        .select('amount, from_client, to_client')
        .eq('status', 'completed');

      if (transfersError) {
        console.error("Error fetching transfers:", transfersError);
        throw transfersError;
      }

      console.log(`Dashboard: Found ${transfers?.length || 0} transfers`);

      const total_deposits = deposits?.reduce((sum, d) => sum + Number(d.amount), 0) || 0;
      const total_withdrawals = withdrawals?.reduce((sum, w) => sum + Number(w.amount), 0) || 0;
      const total_balance = balanceData?.reduce((sum, client) => sum + Number(client.solde), 0) || 0;
      const sent_transfers = transfers?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;
      const received_transfers = transfers?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;

      console.log("Dashboard stats calculated:", {
        total_deposits,
        total_withdrawals,
        client_count: clientCount || 0,
        transfer_count: monthlyStats?.[0]?.transfer_count || 0,
        total_balance,
        sent_transfers,
        received_transfers
      });

      setStats({
        total_deposits,
        total_withdrawals,
        client_count: clientCount || 0,
        transfer_count: monthlyStats?.[0]?.transfer_count || 0,
        monthly_stats: monthlyStats || [],
        total_balance,
        sent_transfers,
        received_transfers
      });
    } catch (error: any) {
      console.error('Error fetching dashboard stats:', error);
      setError(error.message || "Erreur lors du chargement des statistiques");
      toast.error("Erreur lors du chargement des statistiques", {
        description: error.message || "Veuillez rafraîchir la page"
      });
    } finally {
      setIsLoading(false);
      console.log("Dashboard: Stats fetch completed");
    }
  };

  const fetchRecentActivity = async () => {
    try {
      console.log("Dashboard: Fetching recent activity...");
      
      // Vérifier que la connexion Supabase est disponible
      if (!supabase) {
        throw new Error("La connexion Supabase n'est pas disponible");
      }
      
      // Récupérer les versements récents
      const { data: recentDeposits, error: depositsError } = await supabase
        .from('deposits')
        .select('id, amount, created_at, client_name, status, notes')
        .order('created_at', { ascending: false })
        .limit(5);

      if (depositsError) {
        console.error("Error fetching recent deposits:", depositsError);
        throw depositsError;
      }

      console.log(`Dashboard: Found ${recentDeposits?.length || 0} recent deposits`);

      // Récupérer les retraits récents
      const { data: recentWithdrawals, error: withdrawalsError } = await supabase
        .from('withdrawals')
        .select('id, amount, created_at, client_name, status, notes')
        .order('created_at', { ascending: false })
        .limit(5);

      if (withdrawalsError) {
        console.error("Error fetching recent withdrawals:", withdrawalsError);
        throw withdrawalsError;
      }

      console.log(`Dashboard: Found ${recentWithdrawals?.length || 0} recent withdrawals`);

      // Récupérer les transferts récents
      const { data: recentTransfers, error: transfersError } = await supabase
        .from('transfers')
        .select('id, amount, created_at, from_client, to_client, status, reason')
        .order('created_at', { ascending: false })
        .limit(5);

      if (transfersError) {
        console.error("Error fetching recent transfers:", transfersError);
        throw transfersError;
      }

      console.log(`Dashboard: Found ${recentTransfers?.length || 0} recent transfers`);

      // Combiner et formater les résultats
      const allActivity = [
        ...(recentDeposits?.map(d => ({
          id: d.id.toString(),
          type: 'deposit' as const,
          amount: d.amount,
          date: d.created_at,
          client_name: d.client_name,
          fromClient: d.client_name,
          status: d.status,
          description: d.notes || `Versement pour ${d.client_name}`
        })) || []),
        ...(recentWithdrawals?.map(w => ({
          id: w.id.toString(),
          type: 'withdrawal' as const,
          amount: w.amount,
          date: w.created_at,
          client_name: w.client_name,
          fromClient: w.client_name,
          status: w.status,
          description: w.notes || `Retrait par ${w.client_name}`
        })) || []),
        ...(recentTransfers?.map(t => ({
          id: t.id.toString(),
          type: 'transfer' as const,
          amount: t.amount,
          date: t.created_at,
          client_name: `${t.from_client} → ${t.to_client}`,
          fromClient: t.from_client,
          toClient: t.to_client,
          status: t.status,
          description: t.reason || `Virement de ${t.from_client} vers ${t.to_client}`
        })) || [])
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 10);

      console.log(`Dashboard: Combined ${allActivity.length} recent activities`);
      
      setRecentActivity(allActivity);
    } catch (error: any) {
      console.error('Error fetching recent activity:', error);
      toast.error("Erreur lors du chargement de l'activité récente", {
        description: error.message || "Veuillez rafraîchir la page"
      });
    }
  };

  const handleRefresh = () => {
    setIsLoading(true);
    fetchStats();
    fetchRecentActivity();
    toast.success("Statistiques actualisées");
  };

  useEffect(() => {
    console.log("Dashboard: Component mounted, fetching data...");
    let isMounted = true;
    
    const loadData = async () => {
      try {
        await fetchStats();
        if (isMounted) {
          await fetchRecentActivity();
        }
      } catch (error) {
        console.error("Dashboard: Error loading initial data:", error);
      }
    };
    
    loadData();
    
    const interval = setInterval(() => {
      if (isMounted) {
        console.log("Dashboard: Auto-refreshing data...");
        fetchStats();
        fetchRecentActivity();
      }
    }, 30000);
    
    return () => {
      isMounted = false;
      clearInterval(interval);
      console.log("Dashboard: Component unmounting");
    };
  }, []);

  return {
    stats,
    isLoading,
    error,
    recentActivity,
    handleRefresh
  };
};
