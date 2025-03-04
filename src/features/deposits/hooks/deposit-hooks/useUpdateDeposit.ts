
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useUpdateDeposit = (
  fetchDeposits: () => Promise<void>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const updateDeposit = async (depositId: number, updates: { client_name: string; amount: number; notes?: string }) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Vous devez être connecté pour modifier un versement");
        return false;
      }

      const { error } = await supabase
        .from('deposits')
        .update({
          client_name: updates.client_name,
          amount: updates.amount,
          notes: updates.notes
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
