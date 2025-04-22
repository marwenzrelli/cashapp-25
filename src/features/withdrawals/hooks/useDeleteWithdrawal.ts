
import { useState } from "react";
import { Withdrawal } from "../types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatId } from "@/utils/formatId";

export const useDeleteWithdrawal = (fetchWithdrawals: () => Promise<void>) => {
  const [withdrawalToDelete, setWithdrawalToDelete] = useState<Withdrawal | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  const deleteWithdrawal = (withdrawal: Withdrawal) => {
    console.log("Préparation de la suppression du retrait:", withdrawal);
    setWithdrawalToDelete(withdrawal);
    setShowDeleteDialog(true);
  };

  const confirmDeleteWithdrawal = async () => {
    if (!withdrawalToDelete) {
      console.error("Aucun retrait sélectionné pour la suppression");
      return false;
    }
    
    setLoading(true);
    
    try {
      console.log("Début de la suppression du retrait avec ID:", formatId(withdrawalToDelete.id, 4));
      
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      
      if (!userId) {
        toast.error("Vous devez être connecté pour supprimer un retrait");
        throw new Error("Utilisateur non authentifié");
      }
      
      // Récupérer les détails complets du retrait avant suppression
      const withdrawalId = typeof withdrawalToDelete.id === 'string' 
        ? parseInt(withdrawalToDelete.id, 10)
        : withdrawalToDelete.id;
        
      const { data: withdrawalData, error: fetchError } = await supabase
        .from('withdrawals')
        .select('*')
        .eq('id', withdrawalId)
        .single();
        
      if (fetchError) {
        console.error("Erreur lors de la récupération des détails du retrait:", fetchError);
        toast.error("Erreur lors de la récupération des détails du retrait", {
          description: fetchError.message
        });
        throw fetchError;
      }
      
      if (!withdrawalData) {
        console.error("Aucune donnée de retrait trouvée pour l'ID:", withdrawalId);
        toast.error("Retrait introuvable", {
          description: "Impossible de trouver les détails du retrait à supprimer."
        });
        throw new Error("Retrait introuvable");
      }
      
      // Préparer les données à insérer dans deleted_withdrawals
      const logEntry = {
        original_id: withdrawalData.id,
        client_name: withdrawalData.client_name,
        amount: Number(withdrawalData.amount),
        operation_date: withdrawalData.operation_date || withdrawalData.created_at,
        notes: withdrawalData.notes || null,
        deleted_by: userId,
        status: withdrawalData.status
      };
      
      // Insérer dans la table des retraits supprimés
      const { error: logError } = await supabase
        .from('deleted_withdrawals')
        .insert(logEntry);
        
      if (logError) {
        console.error("Erreur lors de l'enregistrement dans deleted_withdrawals:", logError);
        throw logError;
      } 
      
      // Maintenant supprimer le retrait original
      const { error: deleteError } = await supabase
        .from('withdrawals')
        .delete()
        .eq('id', withdrawalId);
        
      if (deleteError) {
        console.error("Erreur lors de la suppression du retrait:", deleteError);
        toast.error("Erreur lors de la suppression du retrait", {
          description: deleteError.message
        });
        throw deleteError;
      }
      
      toast.success("Retrait supprimé avec succès");
      
      // Rafraîchir les données
      await fetchWithdrawals();
      return true;
    } catch (error: any) {
      console.error("Erreur lors de la suppression du retrait:", error);
      toast.error("Erreur lors de la suppression", {
        description: error.message || "Une erreur s'est produite lors de la suppression du retrait.",
      });
      return false;
    } finally {
      setLoading(false);
      // Important: fermer le dialogue et nettoyer l'état après la suppression
      setWithdrawalToDelete(null);
      setShowDeleteDialog(false);
    }
  };

  return {
    withdrawalToDelete,
    showDeleteDialog,
    setShowDeleteDialog,
    deleteWithdrawal,
    confirmDeleteWithdrawal,
    isLoading: loading
  };
};
