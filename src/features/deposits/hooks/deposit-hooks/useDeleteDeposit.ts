
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Deposit } from "@/components/deposits/types";

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

      const { data: depositToDelete, error: fetchError } = await supabase
        .from('deposits')
        .select('*')
        .eq('id', depositId)
        .single();

      if (fetchError) {
        console.error("Erreur lors de la récupération des détails du dépôt:", fetchError);
        throw new Error(`Impossible de récupérer les détails du dépôt: ${fetchError.message}`);
      }

      if (!depositToDelete) {
        throw new Error(`Dépôt avec l'ID ${depositId} non trouvé`);
      }

      console.log("Détails du dépôt à supprimer:", depositToDelete);
      
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;

      // First, try to archive the deposit in deleted_deposits
      const { error: logError } = await supabase
        .from('deleted_deposits')
        .insert({
          original_id: depositToDelete.id,
          client_name: depositToDelete.client_name,
          amount: depositToDelete.amount,
          operation_date: depositToDelete.operation_date,
          notes: depositToDelete.notes || null,
          deleted_by: userId,
          status: depositToDelete.status
        });

      // If we can't archive, log but continue with deletion
      if (logError) {
        console.error("Erreur lors de la création du log de suppression:", logError);
        console.error("Détails complets de l'erreur:", JSON.stringify(logError));
        
        // But don't fail the operation - we'll try to delete anyway
        console.warn("Impossible d'archiver le dépôt dans deleted_deposits, mais la suppression va continuer");
      } else {
        console.log("Log de suppression créé avec succès dans deleted_deposits");
      }

      // Now delete the deposit
      const { error: deleteError } = await supabase
        .from('deposits')
        .delete()
        .eq('id', depositId);

      if (deleteError) {
        throw new Error(`Erreur lors de la suppression du dépôt: ${deleteError.message}`);
      }

      // Update the local state to remove the deleted deposit
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

  const confirmDeleteDeposit = async () => {
    if (!depositToDelete) {
      toast.error("Aucun versement sélectionné pour la suppression");
      return false;
    }
    
    try {
      console.log("Confirmation de la suppression du versement:", depositToDelete);
      
      const success = await deleteDeposit(depositToDelete.id);
      
      if (success) {
        setDepositToDelete(null);
        return true;
      } else {
        throw new Error("Échec de la suppression du versement");
      }
    } catch (error) {
      console.error("Erreur lors de la confirmation de suppression:", error);
      return false;
    }
  };

  return { deleteDeposit, confirmDeleteDeposit };
};
