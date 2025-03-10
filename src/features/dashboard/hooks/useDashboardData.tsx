import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DashboardStats, RecentActivity, SortOption } from "../types";
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
  const [sortOption, setSortOption] = useState<SortOption>("date-desc");

  const generateMonthlyStats = async () => {
    try {
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
          
        if (depositsError) throw depositsError;
        
        const { data: monthWithdrawals, error: withdrawalsError } = await supabase
          .from('withdrawals')
          .select('amount')
          .gte('created_at', startStr)
          .lte('created_at', endStr)
          .eq('status', 'completed');
          
        if (withdrawalsError) throw withdrawalsError;
        
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
      
      return monthlyData;
    } catch (error) {
      console.error("Error generating monthly stats:", error);
      return [];
    }
  };

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

  const fetchRecentActivity = useCallback(async () => {
    try {
      console.log("Fetching recent activity...");
      const { data: recentDeposits, error: depositsError } = await supabase
        .from('deposits')
        .select('id, amount, created_at, client_name, status, notes')
        .order('created_at', { ascending: false })
        .limit(20);

      if (depositsError) throw depositsError;

      const { data: recentWithdrawals, error: withdrawalsError } = await supabase
        .from('withdrawals')
        .select('id, amount, created_at, client_name, status, notes')
        .order('created_at', { ascending: false })
        .limit(20);

      if (withdrawalsError) throw withdrawalsError;

      const { data: recentTransfers, error: transfersError } = await supabase
        .from('transfers')
        .select('id, amount, created_at, from_client, to_client, status, reason')
        .order('created_at', { ascending: false })
        .limit(20);

      if (transfersError) throw transfersError;

      console.log("Raw data fetched:", { 
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
      ];

      const sortedActivities = sortActivities(allActivity, sortOption);
      
      console.log("Formatted activities:", sortedActivities.length);
      setRecentActivity(sortedActivities);
    } catch (error: any) {
      console.error('Error fetching recent activity:', error);
      toast.error("Erreur lors du chargement de l'activité récente");
      setRecentActivity([]);
    }
  }, [sortOption]);

  const sortActivities = (activities: RecentActivity[], option: SortOption): RecentActivity[] => {
    const activitiesToSort = [...activities];

    switch (option) {
      case 'date-asc':
        return activitiesToSort.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      case 'date-desc':
        return activitiesToSort.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      case 'amount-asc':
        return activitiesToSort.sort((a, b) => a.amount - b.amount);
      case 'amount-desc':
        return activitiesToSort.sort((a, b) => b.amount - a.amount);
      case 'type':
        return activitiesToSort.sort((a, b) => a.type.localeCompare(b.type));
      case 'client':
        return activitiesToSort.sort((a, b) => a.client_name.localeCompare(b.client_name));
      default:
        return activitiesToSort;
    }
  };

  const handleSortChange = (newSortOption: SortOption) => {
    setSortOption(newSortOption);
    setRecentActivity(prevActivities => sortActivities([...prevActivities], newSortOption));
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setError(null);
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
  }, [dataFetched, fetchStats, fetchRecentActivity]);

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
