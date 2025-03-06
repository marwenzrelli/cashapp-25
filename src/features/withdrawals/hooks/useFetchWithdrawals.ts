
import { useState } from "react";
import { Withdrawal } from "../types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatDate } from "./utils/formatUtils";

export const useFetchWithdrawals = () => {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

      // Transform the data to match our Withdrawal type
      const transformedWithdrawals = data.map(withdrawal => {
        const createdAtIso = withdrawal.created_at;
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

  return {
    withdrawals,
    isLoading: loading,
    error,
    fetchWithdrawals
  };
};
