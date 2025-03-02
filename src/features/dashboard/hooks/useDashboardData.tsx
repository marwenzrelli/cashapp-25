
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

  const fetchStats = async () => {
    try {
      const { data: deposits, error: depositsError } = await supabase
        .from('deposits')
        .select('amount')
        .eq('status', 'completed');

      if (depositsError) throw depositsError;

      const { data: withdrawals, error: withdrawalsError } = await supabase
        .from('withdrawals')
        .select('amount')
        .eq('status', 'completed');

      if (withdrawalsError) throw withdrawalsError;

      const { count: clientCount, error: clientsError } = await supabase
        .from('clients')
        .select('*', { count: 'exact' })
        .eq('status', 'active');

      if (clientsError) throw clientsError;

      const { data: monthlyStats, error: statsError } = await supabase
        .from('operation_statistics')
        .select('*')
        .order('day', { ascending: true })
        .limit(12);

      if (statsError) throw statsError;

      const { data: balanceData, error: balanceError } = await supabase
        .from('clients')
        .select('solde')
        .eq('status', 'active');

      if (balanceError) throw balanceError;

      const { data: transfers, error: transfersError } = await supabase
        .from('transfers')
        .select('amount, from_client, to_client')
        .eq('status', 'completed');

      if (transfersError) throw transfersError;

      const total_deposits = deposits?.reduce((sum, d) => sum + Number(d.amount), 0) || 0;
      const total_withdrawals = withdrawals?.reduce((sum, w) => sum + Number(w.amount), 0) || 0;
      const total_balance = balanceData?.reduce((sum, client) => sum + Number(client.solde), 0) || 0;
      const sent_transfers = transfers?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;
      const received_transfers = transfers?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;

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
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error("Erreur lors du chargement des statistiques");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      // Récupérer les versements récents
      const { data: recentDeposits, error: depositsError } = await supabase
        .from('deposits')
        .select('id, amount, operation_date, client_name, status, motif')
        .order('operation_date', { ascending: false })
        .limit(3);

      if (depositsError) throw depositsError;

      // Récupérer les retraits récents
      const { data: recentWithdrawals, error: withdrawalsError } = await supabase
        .from('withdrawals')
        .select('id, amount, operation_date, client_name, status, motif')
        .order('operation_date', { ascending: false })
        .limit(3);

      if (withdrawalsError) throw withdrawalsError;

      // Récupérer les transferts récents
      const { data: recentTransfers, error: transfersError } = await supabase
        .from('transfers')
        .select('id, amount, operation_date, from_client, to_client, status, reason')
        .order('operation_date', { ascending: false })
        .limit(3);

      if (transfersError) throw transfersError;

      // Combiner et formater les résultats
      const allActivity = [
        ...(recentDeposits?.map(d => ({
          id: d.id.toString(),
          type: 'deposit' as const,
          amount: d.amount,
          date: d.operation_date,
          client_name: d.client_name,
          fromClient: d.client_name,
          status: d.status,
          description: d.motif || `Versement pour ${d.client_name}`
        })) || []),
        ...(recentWithdrawals?.map(w => ({
          id: w.id.toString(),
          type: 'withdrawal' as const,
          amount: w.amount,
          date: w.operation_date,
          client_name: w.client_name,
          fromClient: w.client_name,
          status: w.status,
          description: w.motif || `Retrait par ${w.client_name}`
        })) || []),
        ...(recentTransfers?.map(t => ({
          id: t.id.toString(),
          type: 'transfer' as const,
          amount: t.amount,
          date: t.operation_date,
          client_name: `${t.from_client} → ${t.to_client}`,
          fromClient: t.from_client,
          toClient: t.to_client,
          status: t.status,
          description: t.reason || `Virement de ${t.from_client} vers ${t.to_client}`
        })) || [])
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);

      setRecentActivity(allActivity);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      toast.error("Erreur lors du chargement de l'activité récente");
    }
  };

  const handleRefresh = () => {
    setIsLoading(true);
    fetchStats();
    fetchRecentActivity();
    toast.success("Statistiques actualisées");
  };

  useEffect(() => {
    fetchStats();
    fetchRecentActivity();
    const interval = setInterval(() => {
      fetchStats();
      fetchRecentActivity();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  return {
    stats,
    isLoading,
    recentActivity,
    handleRefresh
  };
};
