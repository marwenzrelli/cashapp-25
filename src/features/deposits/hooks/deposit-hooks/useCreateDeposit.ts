
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Deposit } from "@/components/deposits/types";

export const useCreateDeposit = (
  fetchDeposits: () => Promise<void>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const createDeposit = async (deposit: Deposit) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Vous devez être connecté pour créer un versement");
        return false;
      }

      const { error } = await supabase
        .from('deposits')
        .insert({
          client_name: deposit.client_name,
          amount: deposit.amount,
          operation_date: new Date(deposit.date).toISOString(),
          notes: deposit.description,
          created_by: session.user.id
        });

      if (error) {
        toast.error("Erreur lors de la création du versement");
        console.error("Erreur:", error);
        return false;
      }

      await fetchDeposits();
      toast.success("Nouveau versement créé", {
        description: `Un nouveau versement de ${deposit.amount} TND a été ajouté.`
      });
      return true;
    } catch (error) {
      console.error("Erreur lors de la création:", error);
      toast.error("Erreur lors de la création du versement");
      return false;
    }
  };

  return { createDeposit };
};
