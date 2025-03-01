import { useState, useEffect } from "react";
import { Withdrawal } from "../types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatId } from "@/utils/formatId";

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
    console.log("Préparation de la suppression du retrait:", withdrawal);
    setWithdrawalToDelete(withdrawal);
    setShowDeleteDialog(true);
  };

  const confirmDeleteWithdrawal = async () => {
    if (!withdrawalToDelete) {
      console.error("Aucun retrait sélectionné pour la suppression");
      return;
    }
    
    setLoading(true);
    
    try {
      console.log("Début de la suppression du retrait avec ID:", formatId(withdrawalToDelete.id));
      console.log("Type de l'ID:", typeof withdrawalToDelete.id);
      
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      
      console.log("Session utilisateur:", session);
      console.log("User ID pour la suppression:", userId);
      
      const { data: withdrawalData, error: fetchError } = await supabase
        .from('withdrawals')
        .select('*')
        .eq('id', withdrawalToDelete.id)
        .single();
        
      if (fetchError) {
        console.error("Erreur lors de la récupération des détails du retrait:", fetchError);
        toast.error("Erreur lors de la récupération des détails du retrait", {
          description: fetchError.message
        });
        throw fetchError;
      }
      
      if (!withdrawalData) {
        console.error("Aucune donnée de retrait trouvée pour l'ID:", withdrawalToDelete.id);
        toast.error("Retrait introuvable", {
          description: "Impossible de trouver les détails du retrait à supprimer."
        });
        throw new Error("Retrait introuvable");
      }
      
      console.log("Récupération des détails du retrait réussie:", withdrawalData);
      
      const logEntry = {
        original_id: withdrawalData.id,
        client_name: withdrawalData.client_name,
        amount: Number(withdrawalData.amount),
        operation_date: withdrawalData.operation_date || withdrawalData.created_at,
        notes: withdrawalData.notes || null,
        deleted_by: userId || null,
        status: withdrawalData.status
      };

      console.log("Données à insérer dans deleted_withdrawals:", JSON.stringify(logEntry));
      
      const { data: logData, error: logError } = await supabase
        .from('deleted_withdrawals')
        .insert(logEntry);
        
      if (logError) {
        console.error("Erreur lors de l'enregistrement dans deleted_withdrawals:", logError);
        console.error("Détails de l'erreur:", logError.message, logError.details, logError.hint);
        console.error("Code de l'erreur:", logError.code);
        throw logError;
      } 
      
      console.log("Retrait enregistré avec succès dans deleted_withdrawals");
      
      // Maintenant supprimer le retrait original
      const { error: deleteError } = await supabase
        .from('withdrawals')
        .delete()
        .eq('id', withdrawalToDelete.id);
        
      if (deleteError) {
        console.error("Erreur lors de la suppression du retrait:", deleteError);
        toast.error("Erreur lors de la suppression du retrait", {
          description: deleteError.message
        });
        throw deleteError;
      }
      
      console.log("Retrait supprimé avec succès, ID:", formatId(withdrawalToDelete.id));
      toast.success("Retrait supprimé avec succès");
      
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
      setWithdrawalToDelete(null);
      setShowDeleteDialog(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

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
