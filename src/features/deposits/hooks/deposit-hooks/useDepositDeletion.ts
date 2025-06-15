
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Deposit } from "@/features/deposits/types";

export const useDepositDeletion = () => {
  const deleteDepositDirectly = async (deposit: Deposit): Promise<boolean> => {
    console.log(`[DIRECT_DELETE] Starting deletion for deposit:`, deposit);
    
    if (!deposit || !deposit.id) {
      console.error("[DIRECT_DELETE] Invalid deposit:", deposit);
      toast.error("Versement invalide");
      return false;
    }

    try {
      // Vérifier la session utilisateur
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error("[DIRECT_DELETE] Session error:", sessionError);
        toast.error("Erreur de session");
        return false;
      }

      if (!session?.user?.id) {
        console.error("[DIRECT_DELETE] No authenticated user");
        toast.error("Vous devez être connecté");
        return false;
      }

      console.log(`[DIRECT_DELETE] User authenticated: ${session.user.email}`);

      // Vérifier les permissions
      const supervisorEmails = [
        'marwen.zrelli.pro@icloud.com',
        'marwen.zrelli@gmail.com'
      ];

      const isSupervisor = session.user.email && 
        supervisorEmails.includes(session.user.email.toLowerCase());

      if (!isSupervisor) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (!profile || !['supervisor', 'manager'].includes(profile.role)) {
          console.error("[DIRECT_DELETE] Insufficient permissions");
          toast.error("Seuls les superviseurs peuvent supprimer des versements");
          return false;
        }
      }

      const depositId = Number(deposit.id);
      if (isNaN(depositId)) {
        console.error("[DIRECT_DELETE] Invalid deposit ID:", deposit.id);
        toast.error("ID de versement invalide");
        return false;
      }

      console.log(`[DIRECT_DELETE] Converting deposit ID: ${deposit.id} -> ${depositId}`);

      // Récupérer les détails du dépôt avant suppression
      const { data: depositData, error: fetchError } = await supabase
        .from('deposits')
        .select('*')
        .eq('id', depositId)
        .single();
        
      if (fetchError) {
        console.error("[DIRECT_DELETE] Failed to fetch deposit:", fetchError);
        toast.error("Dépôt introuvable");
        return false;
      }
      
      if (!depositData) {
        console.error("[DIRECT_DELETE] No deposit data found");
        toast.error("Dépôt introuvable");
        return false;
      }
      
      console.log("[DIRECT_DELETE] Deposit found:", depositData);
      
      // Insérer dans deleted_deposits pour l'audit
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
        console.error("[DIRECT_DELETE] Failed to log deletion:", logError);
        toast.error("Erreur lors de l'enregistrement de la suppression");
        return false;
      }
      
      console.log("[DIRECT_DELETE] Deletion logged successfully");
      
      // Supprimer le dépôt
      const { error: deleteError } = await supabase
        .from('deposits')
        .delete()
        .eq('id', depositId);
        
      if (deleteError) {
        console.error("[DIRECT_DELETE] Failed to delete deposit:", deleteError);
        toast.error("Erreur lors de la suppression du dépôt");
        return false;
      }
      
      console.log("[DIRECT_DELETE] Deposit deleted successfully");
      return true;
      
    } catch (error) {
      console.error("[DIRECT_DELETE] Unexpected error:", error);
      toast.error("Erreur lors de la suppression du versement");
      return false;
    }
  };

  return { deleteDepositDirectly };
};
