
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useDeleteDeposit = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  
  const deleteDeposit = async (depositId: string | number) => {
    setIsDeleting(true);
    try {
      // Get the user session
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      
      // Convert ID to number if it's a string
      const numericId = typeof depositId === 'string' ? parseInt(depositId, 10) : depositId;
      
      // First, get the deposit to log it before deletion
      const { data: depositData, error: fetchError } = await supabase
        .from('deposits')
        .select('*')
        .eq('id', numericId)
        .single();
      
      if (fetchError) {
        console.error("Erreur lors de la récupération du versement:", fetchError);
        toast.error("Échec de la suppression", { description: "Impossible de récupérer les informations du versement" });
        return false;
      }
      
      // Log the deposit in deleted_deposits
      const { error: logError } = await supabase
        .from('deleted_deposits')
        .insert({
          original_id: depositData.id,
          client_name: depositData.client_name,
          amount: Number(depositData.amount),
          operation_date: depositData.operation_date,
          notes: depositData.notes || null,
          deleted_by: userId,
          status: depositData.status
        });
      
      if (logError) {
        console.error("Erreur lors de l'enregistrement dans deleted_deposits:", logError);
        toast.error("Échec de la suppression", { description: "Erreur lors de la journalisation" });
        return false;
      }
      
      // Delete the deposit
      const { error: deleteError } = await supabase
        .from('deposits')
        .delete()
        .eq('id', numericId);
      
      if (deleteError) {
        console.error("Erreur lors de la suppression du versement:", deleteError);
        toast.error("Échec de la suppression", { description: "Erreur lors de la suppression" });
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Erreur lors de la suppression du versement:", error);
      return false;
    } finally {
      setIsDeleting(false);
    }
  };
  
  return {
    deleteDeposit,
    isDeleting
  };
};
