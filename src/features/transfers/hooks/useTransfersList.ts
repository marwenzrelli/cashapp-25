
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Transfer } from "../types";
import { formatDateTime } from "@/features/operations/types";

export const useTransfersList = () => {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTransfers = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('transfers')
        .select('*')
        .order('created_at', { ascending: false });

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
          date: formatDateTime(transfer.created_at), // Utiliser formatDateTime pour la cohérence
          reason: transfer.reason
        }));
        console.log("Virements récupérés:", formattedTransfers);
        setTransfers(formattedTransfers);
      }
    } catch (error) {
      console.error("Error in fetchTransfers:", error);
      toast.error("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransfers();
  }, []);

  return {
    transfers,
    isLoading,
    fetchTransfers
  };
};
