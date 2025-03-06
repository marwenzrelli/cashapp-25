
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Transfer } from "../types";
import { formatDateTime } from "@/features/operations/types";

const fetchTransfersData = async (): Promise<Transfer[]> => {
  try {
    const { data, error } = await supabase
      .from('transfers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching transfers:", error);
      toast.error("Erreur lors du chargement des virements");
      throw error;
    }

    if (data) {
      const formattedTransfers: Transfer[] = data.map(transfer => ({
        id: transfer.id.toString(),
        fromClient: transfer.from_client,
        toClient: transfer.to_client,
        amount: transfer.amount,
        date: formatDateTime(transfer.created_at),
        reason: transfer.reason
      }));
      console.log("Virements récupérés:", formattedTransfers);
      return formattedTransfers;
    }
    
    return [];
  } catch (error) {
    console.error("Error in fetchTransfersData:", error);
    toast.error("Une erreur est survenue");
    throw error;
  }
};

export const useTransfersList = () => {
  const { 
    data: transfers = [], 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['transfers'],
    queryFn: fetchTransfersData,
  });

  if (error) {
    console.error("Error in useTransfersList:", error);
  }

  return {
    transfers: transfers as Transfer[],
    isLoading,
    fetchTransfers: refetch
  };
};
