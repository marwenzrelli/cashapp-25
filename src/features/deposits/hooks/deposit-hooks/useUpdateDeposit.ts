
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { createISOString } from "../utils/dateUtils";

export const useUpdateDeposit = (
  fetchDeposits: () => Promise<void>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const updateDeposit = async (depositId: number, updates: { 
    client_name: string; 
    amount: number; 
    notes?: string;
    date?: string;
    time?: string;
  }) => {
    try {
      // Create the operation_date from date and time inputs (in local timezone)
      const operation_date = updates.date ? 
        createISOString(updates.date, updates.time || '00:00:00') : null;
      
      console.log("Updating deposit with data:", {
        depositId,
        updates,
        operation_date
      });
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Vous devez être connecté pour modifier un versement");
        return false;
      }

      // Add the last_modified_at field with the current timestamp
      const { error } = await supabase
        .from('deposits')
        .update({
          client_name: updates.client_name,
          amount: updates.amount,
          notes: updates.notes,
          operation_date: operation_date,
          last_modified_at: new Date().toISOString() // Add current timestamp
        })
        .eq('id', depositId);

      if (error) {
        toast.error("Erreur lors de la modification du versement");
        console.error("Erreur:", error);
        return false;
      }

      await fetchDeposits();
      return true;
    } catch (error) {
      console.error("Erreur lors de la modification:", error);
      toast.error("Erreur lors de la modification du versement");
      return false;
    }
  };

  return { updateDeposit };
};
