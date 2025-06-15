
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Deposit } from "@/features/deposits/types";
import { showErrorToast } from "@/features/clients/hooks/utils/errorUtils";
import { handleDepositDeletion } from "@/features/operations/utils/deletionUtils";

export const useDeleteDeposit = (
  deposits: Deposit[],
  setDeposits: React.Dispatch<React.SetStateAction<Deposit[]>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  depositToDelete: Deposit | null,
  setDepositToDelete: React.Dispatch<React.SetStateAction<Deposit | null>>,
  setShowDeleteDialog: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const deleteDeposit = async (depositId: number): Promise<boolean> => {
    console.log("Suppression versement ID:", depositId);
    
    // Validation stricte de l'ID
    if (!depositId || isNaN(depositId) || depositId <= 0) {
      console.error("ID de versement invalide:", depositId);
      toast.error("ID de versement invalide");
      return false;
    }
    
    try {
      setIsLoading(true);

      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;

      if (!userId) {
        console.error("Utilisateur non authentifié");
        toast.error("Utilisateur non authentifié");
        return false;
      }

      // Utiliser l'utilitaire centralisé de suppression
      const success = await handleDepositDeletion(depositId, userId);
      
      if (success) {
        console.log("Suppression serveur réussie");
        
        // Mettre à jour l'état local
        setDeposits(prevDeposits => {
          const filteredDeposits = prevDeposits.filter(deposit => {
            const currentId = typeof deposit.id === 'string' 
              ? parseInt(deposit.id, 10) 
              : deposit.id;
            
            return currentId !== depositId;
          });
          
          return filteredDeposits;
        });
        
        toast.success("Versement supprimé avec succès");
        return true;
      } else {
        console.error("Échec de la suppression côté serveur");
        toast.error("La suppression a échoué");
        return false;
      }
    } catch (error) {
      console.error("Erreur dans deleteDeposit:", error);
      showErrorToast("Erreur lors de la suppression du versement", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDeleteDeposit = async (): Promise<boolean> => {
    console.log("Confirmation suppression versement");
    
    if (!depositToDelete) {
      console.error("Aucun versement à supprimer");
      toast.error("Aucun versement sélectionné pour la suppression");
      return false;
    }
    
    try {
      // Conversion et validation de l'ID
      const depositId = typeof depositToDelete.id === 'string' 
        ? parseInt(depositToDelete.id, 10) 
        : depositToDelete.id;
      
      if (isNaN(depositId) || depositId <= 0) {
        console.error("Format d'ID invalide:", depositToDelete.id);
        toast.error("Format d'ID invalide");
        return false;
      }
      
      const result = await deleteDeposit(depositId);
      
      if (result) {
        console.log("Suppression confirmée");
        setDepositToDelete(null);
        setShowDeleteDialog(false);
        return true;
      } else {
        console.error("Échec de deleteDeposit");
        return false;
      }
    } catch (error) {
      console.error("Erreur dans confirmDeleteDeposit:", error);
      showErrorToast("Échec de la suppression du versement", error);
      return false;
    }
  };

  return { deleteDeposit, confirmDeleteDeposit };
};
