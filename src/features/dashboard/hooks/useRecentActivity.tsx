
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { RecentActivity } from "../types";

export const useRecentActivity = () => {
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  const fetchRecentActivity = async () => {
    try {
      // Récupérer les versements récents
      const { data: recentDeposits, error: depositsError } = await supabase
        .from('deposits')
        .select('id, amount, created_at, client_name, status, notes')
        .order('created_at', { ascending: false })
        .limit(5);

      if (depositsError) {
        console.error("Error fetching recent deposits:", depositsError);
        return;
      }

      // Récupérer les retraits récents
      const { data: recentWithdrawals, error: withdrawalsError } = await supabase
        .from('withdrawals')
        .select('id, amount, created_at, client_name, status, notes')
        .order('created_at', { ascending: false })
        .limit(5);

      if (withdrawalsError) {
        console.error("Error fetching recent withdrawals:", withdrawalsError);
        return;
      }

      // Récupérer les transferts récents
      const { data: recentTransfers, error: transfersError } = await supabase
        .from('transfers')
        .select('id, amount, created_at, from_client, to_client, status, reason')
        .order('created_at', { ascending: false })
        .limit(5);

      if (transfersError) {
        console.error("Error fetching recent transfers:", transfersError);
        return;
      }

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

      setRecentActivity(allActivity);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      // Increment retry count and try again if we haven't exceeded retry limit
      if (retryCount < 3) {
        setRetryCount(prev => prev + 1);
        toast.error("Tentative de reconnexion en cours...");
      } else {
        toast.error("Erreur lors du chargement de l'activité récente");
        setIsLoading(false);
      }
    }
  };

  const resetRetryCount = () => {
    setRetryCount(0);
  };

  return {
    recentActivity,
    isLoading,
    retryCount,
    fetchRecentActivity,
    resetRetryCount
  };
};
