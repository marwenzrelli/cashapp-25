
import { useState, useEffect } from "react";
import { Withdrawal } from "../types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useWithdrawals = () => {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "Date inconnue";
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const fetchWithdrawals = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('withdrawals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Erreur lors de la récupération des retraits:", error);
        setError(error.message);
        toast.error("Erreur lors de la récupération des retraits", {
          description: error.message,
        });
        return;
      }

      if (!data) {
        console.log("Aucun retrait trouvé.");
        setWithdrawals([]);
        return;
      }

      const transformedWithdrawals = data.map(withdrawal => {
        const createdAtIso = withdrawal.created_at;
        
        // We've confirmed that formatDate already handles null values properly
        const formattedDate = formatDate(createdAtIso);
        
        return {
          id: withdrawal.id,
          client_name: withdrawal.client_name,
          amount: withdrawal.amount,
          date: formattedDate,
          notes: withdrawal.notes || "",
          status: withdrawal.status,
        };
      });

      setWithdrawals(transformedWithdrawals);
    } catch (error) {
      console.error("Erreur inattendue lors de la récupération des retraits:", error);
      setError("Erreur inattendue lors de la récupération des retraits.");
      toast.error("Erreur inattendue", {
        description: "Une erreur s'est produite lors de la récupération des retraits.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  // Rename 'loading' to 'isLoading' in the returned object to match what's expected
  return {
    withdrawals,
    isLoading: loading,
    error,
    fetchWithdrawals,
  };
};
