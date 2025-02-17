
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
}

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
        .order('created_at', { ascending: false });

      if (error) {
        toast.error("Erreur lors du chargement des retraits");
        console.error("Erreur:", error);
        return;
      }

      setWithdrawals(data);
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
