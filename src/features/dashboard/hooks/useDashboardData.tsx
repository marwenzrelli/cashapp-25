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
      
      // Utiliser la RPC pour obtenir les stats agrégées directement depuis la DB
      // Ceci évite la limite de 1000 lignes de Supabase
      const { data: dbStats, error: rpcError } = await supabase.rpc('get_dashboard_stats');
      
      if (rpcError) throw rpcError;

      const s = dbStats as any;
      console.log(`Dashboard stats via RPC:`, s);

      // Génération simplifiée des statistiques mensuelles
      const monthlyStats = [];
      const today = new Date();
      
      for (let i = 5; i >= 0; i--) {
        const month = subMonths(today, i);
        const monthLabel = format(month, 'MMM');
        
        monthlyStats.push({
          day: monthLabel,
          total_deposits: Math.round(Number(s.deposit_total) / 6),
          total_withdrawals: Math.round(Number(s.withdrawal_total) / 6),
          deposits_count: Math.round(Number(s.deposit_count) / 6),
          withdrawals_count: Math.round(Number(s.withdrawal_count) / 6)
        });
      }

      setStats({
        total_deposits: Number(s.deposit_count),
        total_withdrawals: Number(s.withdrawal_count),
        total_deposits_amount: Number(s.deposit_total),
        total_withdrawals_amount: Number(s.withdrawal_total),
        client_count: Number(s.client_count),
        transfer_count: Number(s.transfer_count),
        monthly_stats: monthlyStats,
        total_balance: Number(s.total_balance),
        sent_transfers: Number(s.transfer_total),
        received_transfers: Number(s.transfer_total)
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
