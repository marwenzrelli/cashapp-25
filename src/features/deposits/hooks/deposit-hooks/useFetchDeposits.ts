
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Deposit } from "@/components/deposits/types";
import { formatDateTime } from "../utils/dateUtils";

export const useFetchDeposits = (
  setDeposits: React.Dispatch<React.SetStateAction<Deposit[]>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const fetchDeposits = async () => {
    try {
      const { data, error } = await supabase
        .from('deposits')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast.error("Erreur lors du chargement des versements");
        console.error("Erreur:", error);
        return;
      }

      const formattedDeposits: Deposit[] = data.map(d => ({
        id: d.id,
        amount: Number(d.amount),
        date: formatDateTime(d.operation_date),
        description: d.notes || '',
        client_name: d.client_name,
        status: d.status,
        created_at: d.created_at,
        created_by: d.created_by,
        operation_date: d.operation_date
      }));

      setDeposits(formattedDeposits);
    } catch (error) {
      console.error("Erreur lors du chargement des versements:", error);
      toast.error("Erreur lors du chargement des versements");
    } finally {
      setIsLoading(false);
    }
  };

  return { fetchDeposits };
};
