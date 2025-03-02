
import { supabase } from "@/integrations/supabase/client";
import { Operation, formatDateTime } from "../types";
import { toast } from "sonner";

export const useFetchOperations = (
  setOperations: (operations: Operation[]) => void,
  setIsLoading: (isLoading: boolean) => void
) => {
  const fetchAllOperations = async () => {
    try {
      const { data: deposits, error: depositsError } = await supabase
        .from('deposits')
        .select('*')
        .order('created_at', { ascending: false });

      if (depositsError) throw depositsError;

      const { data: withdrawals, error: withdrawalsError } = await supabase
        .from('withdrawals')
        .select('*')
        .order('created_at', { ascending: false });

      if (withdrawalsError) throw withdrawalsError;

      const { data: transfers, error: transfersError } = await supabase
        .from('transfers')
        .select('*')
        .order('created_at', { ascending: false });

      if (transfersError) throw transfersError;

      const formattedOperations: Operation[] = [
        ...deposits.map((d): Operation => ({
          id: d.id.toString(),
          type: "deposit",
          amount: d.amount,
          date: d.created_at,
          createdAt: d.created_at,
          description: `Versement de ${d.client_name}`,
          fromClient: d.client_name,
          formattedDate: formatDateTime(d.created_at)
        })),
        ...withdrawals.map((w): Operation => ({
          id: w.id,
          type: "withdrawal",
          amount: w.amount,
          date: w.created_at,
          createdAt: w.created_at,
          description: `Retrait par ${w.client_name}`,
          fromClient: w.client_name,
          formattedDate: formatDateTime(w.created_at)
        })),
        ...transfers.map((t): Operation => ({
          id: t.id,
          type: "transfer",
          amount: t.amount,
          date: t.created_at,
          createdAt: t.created_at,
          description: t.reason,
          fromClient: t.from_client,
          toClient: t.to_client,
          formattedDate: formatDateTime(t.created_at)
        }))
      ].sort((a, b) => new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime());

      setOperations(formattedOperations);
    } catch (error) {
      console.error("Erreur lors du chargement des opérations:", error);
      toast.error("Erreur lors du chargement des opérations");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    fetchAllOperations
  };
};
