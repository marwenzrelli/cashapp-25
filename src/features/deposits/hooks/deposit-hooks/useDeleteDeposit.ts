
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
    console.log(`[DELETE-DEBUG] === DÉBUT DE LA SUPPRESSION ===`);
    console.log(`[DELETE-DEBUG] ID reçu: ${depositId} (type: ${typeof depositId})`);
    
    if (!depositId || isNaN(depositId) || depositId <= 0) {
      console.error("[DELETE-DEBUG] ❌ ERREUR: ID invalide:", depositId);
      toast.error("ID de versement invalide");
      return false;
    }
    
    try {
      setIsLoading(true);
      console.log("[DELETE-DEBUG] ✅ isLoading défini à true");

      // Étape 1: Vérification de la session
      console.log("[DELETE-DEBUG] === ÉTAPE 1: VÉRIFICATION SESSION ===");
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      console.log("[DELETE-DEBUG] Session:", !!session);
      console.log("[DELETE-DEBUG] User ID:", userId);
      console.log("[DELETE-DEBUG] User email:", session?.user?.email);

      if (!userId) {
        console.error("[DELETE-DEBUG] ❌ ERREUR: Pas d'utilisateur connecté");
        toast.error("Vous devez être connecté pour supprimer un versement");
        return false;
      }

      // Étape 2: Vérification des permissions
      console.log("[DELETE-DEBUG] === ÉTAPE 2: VÉRIFICATION PERMISSIONS ===");
      const supervisorEmails = [
        'marwen.zrelli.pro@icloud.com',
        'marwen.zrelli@gmail.com'
      ];

      const isSupervisorByEmail = session.user.email && 
        supervisorEmails.includes(session.user.email.toLowerCase());

      console.log("[DELETE-DEBUG] Email utilisateur:", session.user.email);
      console.log("[DELETE-DEBUG] Est superviseur par email:", isSupervisorByEmail);

      if (!isSupervisorByEmail) {
        console.log("[DELETE-DEBUG] Vérification du rôle dans la base de données...");
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', userId)
          .single();

        console.log("[DELETE-DEBUG] Profil récupéré:", profile);
        console.log("[DELETE-DEBUG] Erreur profil:", profileError);

        if (profileError) {
          console.error("[DELETE-DEBUG] ❌ ERREUR: Impossible de récupérer le profil:", profileError);
          toast.error("Erreur lors de la vérification des permissions");
          return false;
        }

        if (profile && !['supervisor', 'manager'].includes(profile.role)) {
          console.error("[DELETE-DEBUG] ❌ ERREUR: Rôle insuffisant:", profile.role);
          toast.error("Seuls les superviseurs et managers peuvent supprimer des versements");
          return false;
        }

        console.log("[DELETE-DEBUG] ✅ Permissions validées par rôle:", profile.role);
      } else {
        console.log("[DELETE-DEBUG] ✅ Permissions validées par email superviseur");
      }

      // Étape 3: Récupération des détails du dépôt
      console.log("[DELETE-DEBUG] === ÉTAPE 3: RÉCUPÉRATION DÉPÔT ===");
      console.log(`[DELETE-DEBUG] Récupération du dépôt ID: ${depositId}`);
      
      const { data: depositData, error: fetchError } = await supabase
        .from('deposits')
        .select('*')
        .eq('id', depositId)
        .single();
        
      console.log("[DELETE-DEBUG] Données dépôt récupérées:", depositData);
      console.log("[DELETE-DEBUG] Erreur récupération:", fetchError);
        
      if (fetchError) {
        console.error("[DELETE-DEBUG] ❌ ERREUR: Impossible de récupérer le dépôt:", fetchError);
        toast.error("Erreur lors de la récupération des détails du dépôt");
        return false;
      }
      
      if (!depositData) {
        console.error("[DELETE-DEBUG] ❌ ERREUR: Aucune donnée trouvée pour l'ID:", depositId);
        toast.error("Dépôt introuvable");
        return false;
      }
      
      console.log("[DELETE-DEBUG] ✅ Dépôt trouvé:", {
        id: depositData.id,
        client_name: depositData.client_name,
        amount: depositData.amount
      });
      
      // Étape 4: Préparation des données pour deleted_deposits
      console.log("[DELETE-DEBUG] === ÉTAPE 4: PRÉPARATION LOG SUPPRESSION ===");
      const logEntry = {
        original_id: depositData.id,
        client_name: depositData.client_name,
        amount: Number(depositData.amount),
        operation_date: depositData.operation_date || depositData.created_at,
        notes: depositData.notes || null,
        deleted_by: userId,
        status: depositData.status
      };
      
      console.log("[DELETE-DEBUG] Données à insérer dans deleted_deposits:", logEntry);
      
      // Étape 5: Insertion dans deleted_deposits
      console.log("[DELETE-DEBUG] === ÉTAPE 5: INSERTION DANS DELETED_DEPOSITS ===");
      const { data: logData, error: logError } = await supabase
        .from('deleted_deposits')
        .insert(logEntry)
        .select();
        
      console.log("[DELETE-DEBUG] Données insérées:", logData);
      console.log("[DELETE-DEBUG] Erreur insertion:", logError);
        
      if (logError) {
        console.error("[DELETE-DEBUG] ❌ ERREUR: Impossible d'insérer dans deleted_deposits:", logError);
        console.error("[DELETE-DEBUG] Détails erreur:", {
          message: logError.message,
          details: logError.details,
          hint: logError.hint,
          code: logError.code
        });
        toast.error("Erreur lors de l'enregistrement de la suppression");
        return false;
      }
      
      console.log("[DELETE-DEBUG] ✅ Insertion dans deleted_deposits réussie");
      
      // Étape 6: Suppression du dépôt original
      console.log("[DELETE-DEBUG] === ÉTAPE 6: SUPPRESSION DÉPÔT ORIGINAL ===");
      const { data: deleteData, error: deleteError } = await supabase
        .from('deposits')
        .delete()
        .eq('id', depositId)
        .select();
        
      console.log("[DELETE-DEBUG] Données supprimées:", deleteData);
      console.log("[DELETE-DEBUG] Erreur suppression:", deleteError);
        
      if (deleteError) {
        console.error("[DELETE-DEBUG] ❌ ERREUR: Impossible de supprimer le dépôt:", deleteError);
        console.error("[DELETE-DEBUG] Détails erreur suppression:", {
          message: deleteError.message,
          details: deleteError.details,
          hint: deleteError.hint,
          code: deleteError.code
        });
        toast.error("Erreur lors de la suppression du dépôt");
        return false;
      }
      
      console.log("[DELETE-DEBUG] ✅ Suppression du dépôt réussie");
      
      // Étape 7: Mise à jour de l'état local
      console.log("[DELETE-DEBUG] === ÉTAPE 7: MISE À JOUR ÉTAT LOCAL ===");
      console.log("[DELETE-DEBUG] Nombre de dépôts avant suppression:", deposits.length);
      
      setDeposits(prevDeposits => {
        const filtered = prevDeposits.filter(deposit => {
          const depositIdToCompare = typeof deposit.id === 'string' ? 
            parseInt(String(deposit.id).replace(/\D/g, ''), 10) : 
            Number(deposit.id);
          const shouldKeep = depositIdToCompare !== depositId;
          if (!shouldKeep) {
            console.log("[DELETE-DEBUG] Suppression du dépôt de l'état local:", deposit.id);
          }
          return shouldKeep;
        });
        console.log("[DELETE-DEBUG] Nombre de dépôts après suppression:", filtered.length);
        return filtered;
      });
      
      console.log("[DELETE-DEBUG] ✅ État local mis à jour");
      console.log("[DELETE-DEBUG] === SUPPRESSION TERMINÉE AVEC SUCCÈS ===");
      
      toast.success("Versement supprimé avec succès");
      return true;
      
    } catch (error) {
      console.error("[DELETE-DEBUG] ❌ ERREUR FATALE:", error);
      console.error("[DELETE-DEBUG] Stack trace:", error instanceof Error ? error.stack : 'No stack trace');
      showErrorToast("Erreur lors de la suppression du versement", error);
      return false;
    } finally {
      console.log("[DELETE-DEBUG] Nettoyage: isLoading défini à false");
      setIsLoading(false);
    }
  };

  const confirmDeleteDeposit = async (): Promise<boolean> => {
    console.log("[CONFIRM-DEBUG] === DÉBUT CONFIRMATION SUPPRESSION ===");
    console.log("[CONFIRM-DEBUG] depositToDelete:", depositToDelete);
    
    if (!depositToDelete) {
      console.error("[CONFIRM-DEBUG] ❌ ERREUR: Aucun dépôt sélectionné");
      toast.error("Aucun versement sélectionné");
      return false;
    }
    
    try {
      // Extraction robuste de l'ID
      let depositId: number;
      const idValue = depositToDelete.id;
      
      console.log("[CONFIRM-DEBUG] ID brut:", idValue, "type:", typeof idValue);
      
      if (typeof idValue === 'number') {
        depositId = idValue;
      } else {
        const stringValue = String(idValue);
        const numericPart = stringValue.replace(/\D/g, '');
        depositId = parseInt(numericPart, 10);
      }
      
      console.log("[CONFIRM-DEBUG] ID extrait:", depositId);
      
      if (isNaN(depositId) || depositId <= 0) {
        console.error("[CONFIRM-DEBUG] ❌ ERREUR: ID invalide après extraction:", depositId);
        toast.error("Format d'ID invalide");
        return false;
      }
      
      console.log(`[CONFIRM-DEBUG] Appel de deleteDeposit avec ID: ${depositId}`);
      const result = await deleteDeposit(depositId);
      
      console.log("[CONFIRM-DEBUG] Résultat de deleteDeposit:", result);
      
      if (result) {
        console.log("[CONFIRM-DEBUG] ✅ Suppression réussie, nettoyage état");
        setDepositToDelete(null);
        setShowDeleteDialog(false);
        return true;
      } else {
        console.error("[CONFIRM-DEBUG] ❌ Suppression échouée");
        return false;
      }
    } catch (error) {
      console.error("[CONFIRM-DEBUG] ❌ ERREUR dans confirmDeleteDeposit:", error);
      showErrorToast("Échec de la suppression du versement", error);
      return false;
    }
  };

  return { deleteDeposit, confirmDeleteDeposit };
};
