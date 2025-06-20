import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DashboardStats, RecentActivity } from "../types";
import { format, subMonths } from "date-fns";

export const useDashboardData = () => {
  const [stats, setStats] = useState<DashboardStats>({
    total_deposits: 0,
    total_withdrawals: 0,
    total_deposits_amount: 0,
    total_withdrawals_amount: 0,
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

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Calcul simplifié et direct du solde général
      // On utilise directement la somme des soldes des clients actifs
      const { data: clientBalances, error: balanceError } = await supabase
        .from('clients')
        .select('solde')
        .eq('status', 'active');

      if (balanceError) throw balanceError;

      // Calcul simple et direct du solde total
      const total_balance = clientBalances?.reduce((sum, client) => {
        const balance = Number(client.solde) || 0;
        return sum + balance;
      }, 0) || 0;

      // Requêtes parallèles pour les autres statistiques
      const [
        depositsResult,
        withdrawalsResult,
        clientsResult,
        transfersResult
      ] = await Promise.all([
        supabase.from('deposits').select('amount').eq('status', 'completed'),
        supabase.from('withdrawals').select('amount').eq('status', 'completed'),
        supabase.from('clients').select('*', { count: 'exact' }).eq('status', 'active'),
        supabase.from('transfers').select('amount').eq('status', 'completed')
      ]);

      // Vérification des erreurs
      if (depositsResult.error) throw depositsResult.error;
      if (withdrawalsResult.error) throw withdrawalsResult.error;
      if (clientsResult.error) throw clientsResult.error;
      if (transfersResult.error) throw transfersResult.error;

      // Calculs des montants et nombres
      const deposits_count = depositsResult.data?.length || 0;
      const withdrawals_count = withdrawalsResult.data?.length || 0;
      const total_deposits_amount = depositsResult.data?.reduce((sum, d) => sum + Number(d.amount), 0) || 0;
      const total_withdrawals_amount = withdrawalsResult.data?.reduce((sum, w) => sum + Number(w.amount), 0) || 0;
      const sent_transfers = transfersResult.data?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;

      // Génération simplifiée des statistiques mensuelles
      const monthlyStats = [];
      const today = new Date();
      
      for (let i = 5; i >= 0; i--) {
        const month = subMonths(today, i);
        const monthLabel = format(month, 'MMM');
        
        monthlyStats.push({
          day: monthLabel,
          total_deposits: Math.round(total_deposits_amount / 6),
          total_withdrawals: Math.round(total_withdrawals_amount / 6),
          deposits_count: Math.round(deposits_count / 6),
          withdrawals_count: Math.round(withdrawals_count / 6)
        });
      }

      // Mise à jour avec les valeurs calculées
      setStats({
        total_deposits: deposits_count, // Nombre de dépôts
        total_withdrawals: withdrawals_count, // Nombre de retraits
        total_deposits_amount, // Montant total des dépôts
        total_withdrawals_amount, // Montant total des retraits
        client_count: clientsResult.count || 0,
        transfer_count: transfersResult.data?.length || 0,
        monthly_stats: monthlyStats,
        total_balance, // Utilise directement la somme des soldes clients
        sent_transfers,
        received_transfers: sent_transfers
      });
      
    } catch (error: any) {
      console.error('Error fetching stats:', error);
      setError(error.message || "Erreur lors du chargement des statistiques");
      toast.error("Erreur lors du chargement des statistiques");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchRecentActivity = useCallback(async () => {
    try {
      // Requêtes parallèles limitées pour l'activité récente
      const [depositsResult, withdrawalsResult, transfersResult] = await Promise.all([
        supabase
          .from('deposits')
          .select('id, amount, created_at, client_name, status, notes')
          .order('created_at', { ascending: false })
          .limit(8),
        supabase
          .from('withdrawals')
          .select('id, amount, created_at, client_name, status, notes')
          .order('created_at', { ascending: false })
          .limit(8),
        supabase
          .from('transfers')
          .select('id, amount, created_at, from_client, to_client, status, reason')
          .order('created_at', { ascending: false })
          .limit(8)
      ]);

      if (depositsResult.error) throw depositsResult.error;
      if (withdrawalsResult.error) throw withdrawalsResult.error;
      if (transfersResult.error) throw transfersResult.error;

      const allActivity = [
        ...(depositsResult.data || []).map(d => ({
          id: d.id.toString(),
          type: 'deposit' as const,
          amount: d.amount,
          date: d.created_at,
          client_name: d.client_name,
          fromClient: d.client_name,
          status: d.status,
          description: d.notes || `Versement pour ${d.client_name}`
        })),
        ...(withdrawalsResult.data || []).map(w => ({
          id: w.id.toString(),
          type: 'withdrawal' as const,
          amount: w.amount,
          date: w.created_at,
          client_name: w.client_name,
          fromClient: w.client_name,
          status: w.status,
          description: w.notes || `Retrait par ${w.client_name}`
        })),
        ...(transfersResult.data || []).map(t => ({
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
       .slice(0, 15);

      setRecentActivity(allActivity);
    } catch (error: any) {
      console.error('Error fetching recent activity:', error);
      setRecentActivity([]);
    }
  }, []);

  const handleRefresh = useCallback(() => {
    fetchStats();
    fetchRecentActivity();
    toast.success("Statistiques actualisées");
  }, [fetchStats, fetchRecentActivity]);

  useEffect(() => {
    fetchStats();
    fetchRecentActivity();
    
    // Actualisation automatique toutes les 10 minutes (réduit la fréquence)
    const interval = setInterval(() => {
      fetchStats();
      fetchRecentActivity();
    }, 10 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [fetchStats, fetchRecentActivity]);

  return {
    stats,
    isLoading,
    error,
    recentActivity,
    handleRefresh
  };
};
