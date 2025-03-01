
import { useState, useEffect } from "react";
import { Withdrawal } from "../types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useWithdrawals = () => {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [withdrawalToDelete, setWithdrawalToDelete] = useState<Withdrawal | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "Date inconnue";
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const fetchWithdrawals = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('withdrawals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Erreur lors de la récupération des retraits:", error);
        setError(error.message);
        toast.error("Erreur lors de la récupération des retraits", {
          description: error.message,
        });
        return;
      }

      if (!data) {
        console.log("Aucun retrait trouvé.");
        setWithdrawals([]);
        return;
      }

      const transformedWithdrawals = data.map(withdrawal => {
        const createdAtIso = withdrawal.created_at;
        
        // We've confirmed that formatDate already handles null values properly
        const formattedDate = formatDate(createdAtIso);
        
        return {
          id: withdrawal.id,
          client_name: withdrawal.client_name,
          amount: withdrawal.amount,
          date: formattedDate,
          notes: withdrawal.notes || "",
          status: withdrawal.status,
        };
      });

      setWithdrawals(transformedWithdrawals);
    } catch (error) {
      console.error("Erreur inattendue lors de la récupération des retraits:", error);
      setError("Erreur inattendue lors de la récupération des retraits.");
      toast.error("Erreur inattendue", {
        description: "Une erreur s'est produite lors de la récupération des retraits.",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteWithdrawal = (withdrawal: Withdrawal) => {
    setWithdrawalToDelete(withdrawal);
    setShowDeleteDialog(true);
  };

  const confirmDeleteWithdrawal = async () => {
    if (!withdrawalToDelete) return;
    
    setLoading(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      
      // Récupérer les détails complets du retrait avant la suppression
      const { data: withdrawalData, error: fetchError } = await supabase
        .from('withdrawals')
        .select('*')
        .eq('id', withdrawalToDelete.id)
        .single();
        
      if (fetchError) {
        console.error("Erreur lors de la récupération des détails du retrait:", fetchError);
        throw fetchError;
      }
      
      if (!withdrawalData) {
        console.error("Aucune donnée de retrait trouvée pour l'ID:", withdrawalToDelete.id);
        throw new Error("Retrait introuvable");
      }
      
      console.log("Enregistrement dans deleted_transfers_log du retrait:", withdrawalData);
      
      // S'assurer que l'enregistrement dans deleted_transfers_log contient tous les champs nécessaires
      const logEntry = {
        original_id: withdrawalToDelete.id,
        operation_type: 'withdrawal',
        client_name: withdrawalData.client_name,
        amount: withdrawalData.amount,
        operation_date: withdrawalData.operation_date,
        reason: withdrawalData.notes || null,
        from_client: withdrawalData.client_name, // Pour maintenir la structure de la table
        to_client: withdrawalData.client_name, // Pour maintenir la structure de la table
        deleted_by: userId || null,
        deleted_at: new Date().toISOString(),
      };

      console.log("Données à insérer dans deleted_transfers_log:", logEntry);
      
      // Enregistrer dans deleted_transfers_log
      const { error: logError } = await supabase
        .from('deleted_transfers_log')
        .insert(logEntry);
        
      if (logError) {
        console.error("Erreur lors de l'enregistrement dans deleted_transfers_log:", logError);
        // Continuer avec la suppression même si l'enregistrement du log échoue
        console.error("Détails de l'erreur:", logError.message, logError.details, logError.hint);
      } else {
        console.log("Retrait enregistré avec succès dans deleted_transfers_log");
      }
      
      // Supprimer le retrait
      const { error: deleteError } = await supabase
        .from('withdrawals')
        .delete()
        .eq('id', withdrawalToDelete.id);
        
      if (deleteError) {
        console.error("Erreur lors de la suppression du retrait:", deleteError);
        throw deleteError;
      }
      
      console.log("Retrait supprimé avec succès, ID:", withdrawalToDelete.id);
      toast.success("Retrait supprimé avec succès");
      
      // Rafraîchir la liste
      fetchWithdrawals();
    } catch (error: any) {
      console.error("Erreur lors de la suppression du retrait:", error);
      toast.error("Erreur lors de la suppression", {
        description: error.message || "Une erreur s'est produite lors de la suppression du retrait.",
      });
    } finally {
      setLoading(false);
      setWithdrawalToDelete(null);
      setShowDeleteDialog(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  // Rename 'loading' to 'isLoading' in the returned object to match what's expected
  return {
    withdrawals,
    isLoading: loading,
    error,
    fetchWithdrawals,
    deleteWithdrawal,
    confirmDeleteWithdrawal,
    withdrawalToDelete,
    showDeleteDialog,
    setShowDeleteDialog
  };
};
