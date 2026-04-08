
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Transfer } from "../types";
import { formatDateTime } from "@/features/operations/types";
import { fetchAllRows } from "@/features/statistics/utils/fetchAllRows";
import { logger } from "@/utils/logger";

const fetchTransfersData = async (): Promise<Transfer[]> => {
  try {
    const data = await fetchAllRows('transfers', { 
      orderBy: 'created_at', 
      ascending: false 
    }) as any[];

    if (data) {
      const formattedTransfers: Transfer[] = data.map(transfer => ({
        id: transfer.id.toString(),
        fromClient: transfer.from_client,
        toClient: transfer.to_client,
        amount: transfer.amount,
        date: formatDateTime(transfer.created_at),
        reason: transfer.reason
      }));
      logger.log("Virements récupérés:", formattedTransfers);
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
