
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { RecentActivity, SortOption } from "../types";
import { sortActivities } from "../utils/activitySorter";

export const useRecentActivity = () => {
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [sortOption, setSortOption] = useState<SortOption>("date-desc");

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

  const handleSortChange = (newSortOption: SortOption) => {
    setSortOption(newSortOption);
    setRecentActivity(prevActivities => sortActivities([...prevActivities], newSortOption));
  };

  return {
    recentActivity,
    sortOption,
    fetchRecentActivity,
    handleSortChange
  };
};
