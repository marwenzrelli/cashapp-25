
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
      // If date is not provided, we need to use the current date to avoid null violation
      let operation_date;
      
      if (updates.date) {
        // Use the provided date and time, ensuring time has a default value if not provided
        operation_date = createISOString(updates.date, updates.time || '00:00:00');
        console.log("Using provided date for operation_date:", operation_date);
      } else {
        // Fallback to current date-time if no date is provided
        operation_date = new Date().toISOString();
        console.log("No date provided, using current date:", operation_date);
      }
      
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
          operation_date: operation_date, // This will never be null now
          last_modified_at: new Date().toISOString()
        })
        .eq('id', depositId);

      if (error) {
        toast.error("Erreur lors de la modification du versement");
        console.error("Erreur:", error);
        return false;
      }

      // Refresh the deposits list after a successful update
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
