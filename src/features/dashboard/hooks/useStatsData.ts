
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DashboardStats } from "../types";
import { generateMonthlyStats } from "../utils/monthlyStatsGenerator";

export const useStatsData = () => {
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
  const [error, setError] = useState<string | null>(null);
  const [dataFetched, setDataFetched] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const fetchStats = useCallback(async (isRetry = false) => {
    if (isRetry) {
      setRetryCount(prev => prev + 1);
    }
    
    try {
      if (!isRetry) setIsLoading(true);
      setError(null);
      
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

      const monthlyStats = await generateMonthlyStats();

      const { data: clientsData, error: clientsDataError } = await supabase
        .from('clients')
        .select('id, solde, status');

      if (clientsDataError) throw clientsDataError;

      const total_balance = clientsData
        ?.filter(client => client.status === 'active')
        ?.reduce((sum, client) => {
          const clientBalance = parseFloat(client.solde?.toString() || '0');
          return sum + clientBalance;
        }, 0) || 0;

      const { data: transfers, error: transfersError } = await supabase
        .from('transfers')
        .select('amount, from_client, to_client')
        .eq('status', 'completed');

      if (transfersError) throw transfersError;

      const total_deposits = deposits?.reduce((sum, d) => sum + parseFloat(d.amount.toString()), 0) || 0;
      const total_withdrawals = withdrawals?.reduce((sum, w) => sum + parseFloat(w.amount.toString()), 0) || 0;
      const sent_transfers = transfers?.reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0) || 0;
      const received_transfers = transfers?.reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0) || 0;
      const transfer_count = transfers?.length || 0;

      console.log(`Dashboard balance calculation:
        Total deposits: ${total_deposits}
        Total withdrawals: ${total_withdrawals}
        Raw calculated balance: ${total_deposits - total_withdrawals}
        Actual client balances sum: ${total_balance}
      `);

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
    } catch (error: any) {
      console.error('Error fetching stats:', error);
      setError(error.message || "Erreur lors du chargement des statistiques");
      
      if (retryCount < 3 && !isRetry) {
        console.log(`Auto-retrying fetch attempt ${retryCount + 1}/3`);
        setTimeout(() => fetchStats(true), 3000);
      } else {
        toast.error("Erreur lors du chargement des statistiques");
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

  return {
    stats,
    isLoading,
    error,
    dataFetched,
    setDataFetched,
    fetchStats
  };
};
