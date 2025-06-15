
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Deposit } from "@/features/deposits/types";
import { showErrorToast } from "@/features/clients/hooks/utils/errorUtils";

export const useDeleteDeposit = (
  deposits: Deposit[],
  setDeposits: React.Dispatch<React.SetStateAction<Deposit[]>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  depositToDelete: Deposit | null,
  setDepositToDelete: React.Dispatch<React.SetStateAction<Deposit | null>>,
  setShowDeleteDialog: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const deleteDeposit = async (depositId: number): Promise<boolean> => {
    console.log(`[DELETE] Starting deletion for deposit ID: ${depositId}`);
    
    if (!depositId || depositId <= 0) {
      console.error("[DELETE] Invalid deposit ID:", depositId);
      toast.error("ID de versement invalide");
      return false;
    }
    
    try {
      setIsLoading(true);
      
      // Vérifier la session utilisateur
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        console.error("[DELETE] No authenticated user");
        toast.error("Vous devez être connecté pour supprimer un versement");
        return false;
      }

      console.log(`[DELETE] User authenticated: ${session.user.email}`);

      // Vérifier les permissions - Superviseurs autorisés
      const supervisorEmails = [
        'marwen.zrelli.pro@icloud.com',
        'marwen.zrelli@gmail.com'
      ];

      const isSupervisor = session.user.email && 
        supervisorEmails.includes(session.user.email.toLowerCase());

      if (!isSupervisor) {
        // Vérifier le rôle dans la base de données
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (!profile || !['supervisor', 'manager'].includes(profile.role)) {
          console.error("[DELETE] Insufficient permissions");
          toast.error("Seuls les superviseurs peuvent supprimer des versements");
          return false;
        }
      }

      console.log("[DELETE] Permissions validated");

      // Récupérer les détails du dépôt
      const { data: depositData, error: fetchError } = await supabase
        .from('deposits')
        .select('*')
        .eq('id', depositId)
        .single();
        
      if (fetchError || !depositData) {
        console.error("[DELETE] Failed to fetch deposit:", fetchError);
        toast.error("Dépôt introuvable");
        return false;
      }
      
      console.log("[DELETE] Deposit found:", depositData.client_name);
      
      // Insérer dans deleted_deposits
      const { error: logError } = await supabase
        .from('deleted_deposits')
        .insert({
          original_id: depositData.id,
          client_name: depositData.client_name,
          amount: Number(depositData.amount),
          operation_date: depositData.operation_date || depositData.created_at,
          notes: depositData.notes || null,
          deleted_by: session.user.id,
          status: depositData.status
        });
        
      if (logError) {
        console.error("[DELETE] Failed to log deletion:", logError);
        toast.error("Erreur lors de l'enregistrement de la suppression");
        return false;
      }
      
      console.log("[DELETE] Deletion logged successfully");
      
      // Supprimer le dépôt
      const { error: deleteError } = await supabase
        .from('deposits')
        .delete()
        .eq('id', depositId);
        
      if (deleteError) {
        console.error("[DELETE] Failed to delete deposit:", deleteError);
        toast.error("Erreur lors de la suppression du dépôt");
        return false;
      }
      
      console.log("[DELETE] Deposit deleted from database");
      
      // Mise à jour de l'état local
      setDeposits(prevDeposits => {
        const filtered = prevDeposits.filter(deposit => deposit.id !== depositId);
        console.log(`[DELETE] Updated local state: ${prevDeposits.length} -> ${filtered.length}`);
        return filtered;
      });
      
      toast.success("Versement supprimé avec succès");
      return true;
      
    } catch (error) {
      console.error("[DELETE] Unexpected error:", error);
      showErrorToast("Erreur lors de la suppression du versement", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDeleteDeposit = async (): Promise<boolean> => {
    console.log("[CONFIRM] Starting confirmation");
    
    if (!depositToDelete) {
      console.error("[CONFIRM] No deposit selected");
      toast.error("Aucun versement sélectionné");
      return false;
    }
    
    try {
      // Extraction simple de l'ID
      const depositId = Number(depositToDelete.id);
      
      if (isNaN(depositId) || depositId <= 0) {
        console.error("[CONFIRM] Invalid ID after extraction:", depositToDelete.id);
        toast.error("Format d'ID invalide");
        return false;
      }
      
      console.log(`[CONFIRM] Calling deleteDeposit with ID: ${depositId}`);
      const result = await deleteDeposit(depositId);
      
      if (result) {
        console.log("[CONFIRM] Deletion successful, cleaning up");
        setDepositToDelete(null);
        setShowDeleteDialog(false);
        return true;
      } else {
        console.error("[CONFIRM] Deletion failed");
        return false;
      }
    } catch (error) {
      console.error("[CONFIRM] Error in confirmDeleteDeposit:", error);
      showErrorToast("Échec de la suppression du versement", error);
      return false;
    }
  };

  return { deleteDeposit, confirmDeleteDeposit };
};
