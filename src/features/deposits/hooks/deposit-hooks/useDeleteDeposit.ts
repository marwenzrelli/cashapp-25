
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Deposit } from "@/components/deposits/types";
import { handleDepositDeletion } from "@/features/operations/utils/deletionUtils";

export const useDeleteDeposit = (
  deposits: Deposit[],
  setDeposits: React.Dispatch<React.SetStateAction<Deposit[]>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  depositToDelete: Deposit | null,
  setDepositToDelete: React.Dispatch<React.SetStateAction<Deposit | null>>,
  setShowDeleteDialog: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const deleteDeposit = async (depositId: number): Promise<boolean | void> => {
    try {
      console.log(`Tentative de suppression du dépôt avec l'ID: ${depositId}`);
      setIsLoading(true);

      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;

      // Use the utility function to handle deletion and logging
      await handleDepositDeletion(depositId.toString(), userId);
      
      // Update UI state after successful deletion
      setDeposits(prevDeposits => prevDeposits.filter(deposit => deposit.id !== depositId));
      
      toast.success("Dépôt supprimé avec succès");
      return true;
    } catch (error) {
      console.error("Erreur complète lors de la suppression:", error);
      toast.error("Erreur lors de la suppression du versement", {
        description: error instanceof Error ? error.message : "Une erreur inconnue est survenue"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDeleteDeposit = async (): Promise<boolean | void> => {
    if (!depositToDelete) {
      toast.error("Aucun versement sélectionné pour la suppression");
      return false;
    }
    
    setIsLoading(true);
    
    try {
      console.log("Confirmation de la suppression du versement:", depositToDelete);
      
      const success = await deleteDeposit(depositToDelete.id);
      
      if (success) {
        setDepositToDelete(null);
        setShowDeleteDialog(false);
        return true;
      } else {
        throw new Error("Échec de la suppression du versement");
      }
    } catch (error) {
      console.error("Erreur lors de la confirmation de suppression:", error);
      toast.error("Erreur lors de la suppression du versement");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { deleteDeposit, confirmDeleteDeposit };
};
