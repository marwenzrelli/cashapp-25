
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface Withdrawal {
  id: string;
  client_name: string;
  amount: number;
  created_at: string;
  operation_date: string;
  notes: string | null;
  status: string;
  created_by: string | null;
  formattedDate?: string;
}

// Fonction utilitaire pour formater la date avec l'heure en format 24h - comme dans useDeposits.ts
const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

export const useWithdrawals = () => {
  const navigate = useNavigate();
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error("Vous devez être connecté pour accéder à cette page");
      navigate("/login");
      return false;
    }
    return true;
  };

  const fetchWithdrawals = async () => {
    try {
      const { data, error } = await supabase
        .from('withdrawals')
        .select('*')
        .order('operation_date', { ascending: false });

      if (error) {
        toast.error("Erreur lors du chargement des retraits");
        console.error("Erreur:", error);
        return;
      }

      // Format the operation_date for consistent display, using the same approach as in useDeposits
      const formattedWithdrawals = data.map(withdrawal => ({
        ...withdrawal,
        formattedDate: formatDateTime(withdrawal.operation_date)
      }));

      console.log("Retraits formatés:", formattedWithdrawals);
      setWithdrawals(formattedWithdrawals);
    } catch (error) {
      console.error("Erreur lors du chargement des retraits:", error);
      toast.error("Erreur lors du chargement des retraits");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      const isAuthenticated = await checkAuth();
      if (isAuthenticated) {
        await fetchWithdrawals();
      }
    };
    init();
  }, []);

  return {
    withdrawals,
    isLoading,
    fetchWithdrawals
  };
};
