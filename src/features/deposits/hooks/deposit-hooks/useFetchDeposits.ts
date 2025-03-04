
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Deposit } from "@/components/deposits/types";
import { formatDateTime } from "@/features/deposits/hooks/utils/dateUtils";

export const useFetchDeposits = (
  setDeposits: React.Dispatch<React.SetStateAction<Deposit[]>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const fetchDeposits = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('deposits')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast.error("Erreur lors du chargement des versements");
        console.error("Erreur:", error);
        return;
      }

      const formattedDeposits: Deposit[] = data.map(d => {
        // Use operation_date for display if it exists, otherwise use created_at
        const displayDate = d.operation_date ? formatDateTime(d.operation_date) : formatDateTime(d.created_at);
        
        return {
          id: d.id,
          amount: Number(d.amount),
          date: displayDate,
          description: d.notes || '',
          client_name: d.client_name,
          status: d.status,
          created_at: d.created_at,
          created_by: d.created_by || null,
          operation_date: d.operation_date,
          last_modified_at: d.last_modified_at
        };
      });

      console.log("Versements chargés:", formattedDeposits);
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
