
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Deposit } from "@/features/deposits/types";
import { formatDateTime } from "@/features/deposits/hooks/utils/dateUtils";
import { useCallback } from "react";
import { fetchAllRows } from "@/features/statistics/utils/fetchAllRows";
import { logger } from "@/utils/logger";

export const useFetchDeposits = (
  setDeposits: React.Dispatch<React.SetStateAction<Deposit[]>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const fetchDeposits = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const data = await fetchAllRows('deposits', { 
        orderBy: 'created_at', 
        ascending: false 
      }) as any[];

      if (!data || data.length === 0) {
        setDeposits([]);
        return;
      }

      logger.log(`Retrieved ${data.length} deposits`);

      const formattedDeposits: Deposit[] = data.map(d => {
        const displayDate = d.operation_date ? formatDateTime(d.operation_date) : formatDateTime(d.created_at);
        
        return {
          id: d.id,
          amount: Number(d.amount),
          date: displayDate,
          description: d.notes || '',
          client_name: d.client_name,
          client_id: d.client_id,
          client_balance: d.clients?.solde || null,
          status: d.status,
          created_at: d.created_at,
          created_by: d.created_by || null,
          operation_date: d.operation_date,
          last_modified_at: d.last_modified_at
        };
      });

      setDeposits(formattedDeposits);
    } catch (error) {
      console.error("Error loading deposits:", error);
      toast.error("Erreur lors du chargement des versements");
      setDeposits([]);
    } finally {
      setIsLoading(false);
    }
  }, [setDeposits, setIsLoading]);

  return { fetchDeposits };
};
