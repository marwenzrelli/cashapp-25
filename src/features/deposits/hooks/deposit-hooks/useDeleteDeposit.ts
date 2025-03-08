
import { Deposit } from "@/features/deposits/types";
import { toast } from "sonner";
import { handleDepositDeletion } from "@/features/operations/utils/deletionUtils";
import { supabase } from "@/integrations/supabase/client";

export const useDeleteDeposit = (
  deposits: Deposit[],
  setDeposits: React.Dispatch<React.SetStateAction<Deposit[]>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  depositToDelete: Deposit | null,
  setDepositToDelete: React.Dispatch<React.SetStateAction<Deposit | null>>,
  setShowDeleteDialog: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const deleteDeposit = async (depositId: number) => {
    try {
      console.log(`Tentative de suppression du dépôt avec l'ID: ${depositId}`);
      setIsLoading(true);

      // Obtenir l'ID de l'utilisateur actuel
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;

      if (!userId) {
        console.warn("Aucun utilisateur authentifié trouvé lors de la suppression du dépôt");
      }

      // Utiliser la fonction centralisée pour la suppression
      const success = await handleDepositDeletion(depositId, userId);
      
      if (!success) {
        throw new Error("La suppression du versement a échoué");
      }

      // Mettre à jour l'état local seulement si la suppression a réussi
      setDeposits(prevDeposits => prevDeposits.filter(deposit => deposit.id !== depositId));
      
      console.log("Dépôt supprimé avec succès, ID:", depositId);
      toast.success("Versement supprimé avec succès");
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

  const confirmDeleteDeposit = async () => {
    if (!depositToDelete) {
      toast.error("Aucun versement sélectionné pour la suppression");
      return false;
    }
    
    try {
      console.log("Confirmation de la suppression du versement:", depositToDelete);
      
      const success = await deleteDeposit(depositToDelete.id);
      
      if (success) {
        console.log("Suppression réussie, réinitialisation de l'état");
        setDepositToDelete(null);
        setShowDeleteDialog(false);
        return true;
      } else {
        console.error("Échec de la suppression du versement");
        return false;
      }
    } catch (error) {
      console.error("Erreur lors de la confirmation de suppression:", error);
      return false;
    }
  };

  return { deleteDeposit, confirmDeleteDeposit };
};
