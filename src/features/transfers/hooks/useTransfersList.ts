
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Transfer } from "../types";

// Fonction utilitaire pour formater la date avec l'heure en format 24h
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

export const useTransfersList = () => {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTransfers = async () => {
    try {
      setIsLoading(true);
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
          date: formatDateTime(transfer.operation_date),
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
