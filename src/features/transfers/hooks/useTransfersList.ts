
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Transfer } from "../types";

export const useTransfersList = () => {
  const [transfers, setTransfers] = useState<Transfer[]>([]);

  const fetchTransfers = async () => {
    try {
      const { data, error } = await supabase
        .from('transfers')
        .select('*')
        .order('operation_date', { ascending: false });

      if (error) {
        console.error("Error fetching transfers:", error);
        toast.error("Erreur lors du chargement des virements");
        return;
      }

      if (data) {
        const formattedTransfers: Transfer[] = data.map(transfer => ({
          id: transfer.id,
          fromClient: transfer.from_client,
          toClient: transfer.to_client,
          amount: transfer.amount,
          date: new Date(transfer.operation_date).toLocaleDateString(),
          reason: transfer.reason
        }));
        setTransfers(formattedTransfers);
      }
    } catch (error) {
      console.error("Error in fetchTransfers:", error);
      toast.error("Une erreur est survenue");
    }
  };

  return {
    transfers,
    fetchTransfers
  };
};
