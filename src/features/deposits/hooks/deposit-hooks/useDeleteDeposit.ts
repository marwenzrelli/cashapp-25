
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
    console.log(`[DELETE] Starting deleteDeposit with ID: ${depositId} (type: ${typeof depositId})`);
    
    if (!depositId || isNaN(depositId) || depositId <= 0) {
      console.error("[DELETE] Invalid deposit ID:", depositId);
      toast.error("ID de versement invalide");
      return false;
    }
    
    try {
      setIsLoading(true);
      console.log("[DELETE] Setting isLoading to true for deletion");

      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      console.log("[DELETE] User ID for deletion:", userId);

      if (!userId) {
        console.error("[DELETE] No authenticated user found");
        toast.error("Vous devez être connecté pour supprimer un versement");
        return false;
      }

      // Superviseur emails - toujours autorisés
      const supervisorEmails = [
        'marwen.zrelli.pro@icloud.com',
        'marwen.zrelli@gmail.com'
      ];

      // Vérifier si c'est un superviseur par email d'abord
      const isSupervisorByEmail = session.user.email && 
        supervisorEmails.includes(session.user.email.toLowerCase());

      if (isSupervisorByEmail) {
        console.log("[DELETE] Superviseur reconnu par email:", session.user.email);
      } else {
        // Vérifier le rôle dans la base de données seulement si pas superviseur par email
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', userId)
          .single();

        if (profileError) {
          console.error("[DELETE] Error fetching user profile:", profileError);
          toast.error("Erreur lors de la vérification des permissions");
          return false;
        }

        if (profile && !['supervisor', 'manager'].includes(profile.role)) {
          console.error("[DELETE] User role insufficient for deletion:", profile.role);
          toast.error("Seuls les superviseurs et managers peuvent supprimer des versements");
          return false;
        }
      }

      console.log("[DELETE] Permissions verified, proceeding with deletion");

      // Effectuer la suppression directement ici au lieu d'utiliser handleDepositDeletion
      console.log(`[DELETE] Fetching deposit details for ID: ${depositId}`);
      
      // Récupérer les détails du dépôt avant suppression
      const { data: depositData, error: fetchError } = await supabase
        .from('deposits')
        .select('*')
        .eq('id', depositId)
        .single();
        
      if (fetchError) {
        console.error("[DELETE] Error fetching deposit details:", fetchError);
        toast.error("Erreur lors de la récupération des détails du dépôt");
        return false;
      }
      
      if (!depositData) {
        console.error("[DELETE] No deposit data found for ID:", depositId);
        toast.error("Dépôt introuvable");
        return false;
      }
      
      console.log("[DELETE] Deposit data found:", depositData);
      
      // Préparer les données à insérer dans deleted_deposits
      const logEntry = {
        original_id: depositData.id,
        client_name: depositData.client_name,
        amount: Number(depositData.amount),
        operation_date: depositData.operation_date || depositData.created_at,
        notes: depositData.notes || null,
        deleted_by: userId,
        status: depositData.status
      };
      
      console.log("[DELETE] Inserting into deleted_deposits:", logEntry);
      
      // Insérer dans la table des dépôts supprimés
      const { error: logError } = await supabase
        .from('deleted_deposits')
        .insert(logEntry);
        
      if (logError) {
        console.error("[DELETE] Error inserting into deleted_deposits:", logError);
        toast.error("Erreur lors de l'enregistrement de la suppression");
        return false;
      }
      
      console.log("[DELETE] Successfully logged deletion, now deleting original");
      
      // Maintenant supprimer le dépôt original
      const { error: deleteError } = await supabase
        .from('deposits')
        .delete()
        .eq('id', depositId);
        
      if (deleteError) {
        console.error("[DELETE] Error deleting deposit:", deleteError);
        toast.error("Erreur lors de la suppression du dépôt");
        return false;
      }
      
      console.log("[DELETE] Deposit deleted successfully from database");
      
      // Mettre à jour l'état local
      console.log("[DELETE] Updating local state");
      setDeposits(prevDeposits => {
        const filtered = prevDeposits.filter(deposit => {
          // Handle both string and number IDs safely
          const depositIdToCompare = typeof deposit.id === 'string' ? 
            parseInt(String(deposit.id).replace(/\D/g, ''), 10) : 
            Number(deposit.id);
          return depositIdToCompare !== depositId;
        });
        console.log(`[DELETE] Filtered deposits: ${prevDeposits.length} -> ${filtered.length}`);
        return filtered;
      });
      
      toast.success("Versement supprimé avec succès");
      return true;
    } catch (error) {
      console.error("[DELETE] Error during deleteDeposit:", error);
      showErrorToast("Erreur lors de la suppression du versement", error);
      return false;
    } finally {
      console.log("[DELETE] Setting isLoading to false");
      setIsLoading(false);
    }
  };

  const confirmDeleteDeposit = async (): Promise<boolean> => {
    console.log("[CONFIRM] confirmDeleteDeposit called with depositToDelete:", depositToDelete);
    
    if (!depositToDelete) {
      console.error("[CONFIRM] No deposit selected for deletion");
      toast.error("Aucun versement sélectionné");
      return false;
    }
    
    try {
      // Extract numeric ID with a more robust approach
      let depositId: number;
      
      // Get the ID value safely
      const idValue = depositToDelete.id;
      console.log("[CONFIRM] Raw deposit ID:", idValue, "type:", typeof idValue);
      
      // Handle different ID formats safely with proper type checking
      if (typeof idValue === 'number') {
        depositId = idValue;
      } else {
        // Convert to string safely and extract numeric part
        const stringValue = String(idValue);
        const numericPart = stringValue.replace(/\D/g, '');
        depositId = parseInt(numericPart, 10);
      }
      
      if (isNaN(depositId) || depositId <= 0) {
        console.error("[CONFIRM] Could not extract valid numeric ID from:", idValue);
        toast.error("Format d'ID invalide");
        return false;
      }
      
      console.log(`[CONFIRM] Attempting to delete deposit with extracted ID: ${depositId}`);
      
      const result = await deleteDeposit(depositId);
      console.log("[CONFIRM] Delete operation result:", result);
      
      if (result) {
        console.log("[CONFIRM] Successful deletion, clearing state");
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
