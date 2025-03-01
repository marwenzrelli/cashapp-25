import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { type Deposit } from "@/components/deposits/types";
import { useNavigate } from "react-router-dom";

// Fonction utilitaire pour formater la date avec l'heure en format 24h incluant les secondes
const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
};

export const useDeposits = () => {
  const navigate = useNavigate();
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [depositToDelete, setDepositToDelete] = useState<Deposit | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error("Vous devez être connecté pour accéder à cette page");
      navigate("/login");
      return false;
    }
    return true;
  };

  const fetchDeposits = async () => {
    try {
      const { data, error } = await supabase
        .from('deposits')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast.error("Erreur lors du chargement des versements");
        console.error("Erreur:", error);
        return;
      }

      const formattedDeposits: Deposit[] = data.map(d => ({
        id: d.id,
        amount: Number(d.amount),
        date: formatDateTime(d.operation_date),
        description: d.notes || '',
        client_name: d.client_name,
        status: d.status,
        created_at: d.created_at,
        created_by: d.created_by,
        operation_date: d.operation_date
      }));

      setDeposits(formattedDeposits);
    } catch (error) {
      console.error("Erreur lors du chargement des versements:", error);
      toast.error("Erreur lors du chargement des versements");
    } finally {
      setIsLoading(false);
    }
  };

  const createDeposit = async (deposit: Deposit) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Vous devez être connecté pour créer un versement");
        return false;
      }

      const { error } = await supabase
        .from('deposits')
        .insert({
          client_name: deposit.client_name,
          amount: deposit.amount,
          operation_date: new Date(deposit.date).toISOString(),
          notes: deposit.description,
          created_by: session.user.id
        });

      if (error) {
        toast.error("Erreur lors de la création du versement");
        console.error("Erreur:", error);
        return false;
      }

      await fetchDeposits();
      toast.success("Nouveau versement créé", {
        description: `Un nouveau versement de ${deposit.amount} TND a été ajouté.`
      });
      return true;
    } catch (error) {
      console.error("Erreur lors de la création:", error);
      toast.error("Erreur lors de la création du versement");
      return false;
    }
  };

  const updateDeposit = async (depositId: number, updates: { client_name: string; amount: number; notes?: string }) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Vous devez être connecté pour modifier un versement");
        return false;
      }

      const { error } = await supabase
        .from('deposits')
        .update({
          client_name: updates.client_name,
          amount: updates.amount,
          notes: updates.notes
        })
        .eq('id', depositId);

      if (error) {
        toast.error("Erreur lors de la modification du versement");
        console.error("Erreur:", error);
        return false;
      }

      await fetchDeposits();
      return true;
    } catch (error) {
      console.error("Erreur lors de la modification:", error);
      toast.error("Erreur lors de la modification du versement");
      return false;
    }
  };

  const deleteDeposit = async (deposit: Deposit) => {
    try {
      if (!deposit || !deposit.id) {
        console.error("Données de versement invalides pour la suppression");
        return false;
      }
      
      console.log("Début de la suppression du versement:", deposit);
      console.log("ID du versement:", deposit.id, "Type:", typeof deposit.id);
      
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      
      // Récupération des détails complets du versement depuis la base de données
      const { data: depositData, error: fetchError } = await supabase
        .from('deposits')
        .select('*')
        .eq('id', deposit.id)
        .single();
        
      if (fetchError || !depositData) {
        console.error("Erreur lors de la récupération des détails du versement:", fetchError);
        toast.error("Erreur lors de la récupération des détails du versement");
        return false;
      }
      
      console.log("Données récupérées du versement:", depositData);
      
      // Préparation des données pour le log avec le format correct
      const logEntry = {
        original_id: String(deposit.id), // Conversion explicite en chaîne
        operation_type: 'deposit',
        client_name: depositData.client_name,
        amount: depositData.amount,
        operation_date: depositData.operation_date,
        reason: depositData.notes || null,
        from_client: depositData.client_name,
        to_client: depositData.client_name,
        deleted_by: userId,
        deleted_at: new Date().toISOString()
      };
      
      console.log("Données préparées pour le log:", logEntry);
      
      // Création du log de suppression avec gestion d'erreur détaillée
      const { data: logData, error: logError } = await supabase
        .from('deleted_transfers_log')
        .insert(logEntry);
        
      if (logError) {
        console.error("Erreur détaillée lors de la création du log de suppression:", {
          message: logError.message,
          details: logError.details,
          hint: logError.hint,
          code: logError.code
        });
        
        // On continue malgré l'erreur de log pour tenter de supprimer le versement
        console.warn("Poursuite de la suppression malgré l'échec de création du log");
      } else {
        console.log("Log de suppression créé avec succès:", logData);
      }
      
      // Suppression du versement après vérification de l'ID
      const depositId = parseInt(String(deposit.id), 10);
      if (isNaN(depositId)) {
        console.error("L'ID du versement n'est pas un nombre valide:", deposit.id);
        toast.error("Erreur: ID de versement invalide");
        return false;
      }
      
      console.log("Tentative de suppression du versement avec ID:", depositId);
      
      const { error: deleteError } = await supabase
        .from('deposits')
        .delete()
        .eq('id', depositId);
        
      if (deleteError) {
        console.error("Erreur détaillée lors de la suppression du versement:", {
          message: deleteError.message,
          details: deleteError.details,
          hint: deleteError.hint,
          code: deleteError.code
        });
        toast.error("Erreur lors de la suppression du versement");
        return false;
      }
      
      console.log("Versement supprimé avec succès");
      
      // Mise à jour de l'état local
      setDeposits(prevDeposits => 
        prevDeposits.filter(d => d.id !== deposit.id)
      );
      
      // Afficher une notification de succès
      toast.success("Versement supprimé", {
        description: `Le versement de ${deposit.amount} TND a été supprimé avec succès.`
      });
      
      return true;
    } catch (error) {
      console.error("Erreur critique détaillée lors de la suppression du versement:", error);
      toast.error("Erreur lors de la suppression du versement");
      return false;
    }
  };

  const confirmDeleteDeposit = async () => {
    if (!depositToDelete) {
      toast.error("Aucun versement sélectionné pour la suppression");
      return false;
    }
    
    setIsLoading(true);
    
    try {
      console.log("Confirmation de la suppression du versement:", depositToDelete);
      
      const success = await deleteDeposit(depositToDelete);
      
      if (success) {
        setDepositToDelete(null);
        setShowDeleteDialog(false);
        return true;
      } else {
        throw new Error("Échec de la suppression du versement");
      }
    } catch (error) {
      console.error("Erreur lors de la confirmation de suppression:", error);
      toast.error("Erreur lors de la suppression du versement");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      const isAuthenticated = await checkAuth();
      if (isAuthenticated) {
        await fetchDeposits();
      }
    };
    init();
  }, []);

  return {
    deposits,
    isLoading,
    createDeposit,
    deleteDeposit,
    updateDeposit,
    fetchDeposits,
    depositToDelete,
    showDeleteDialog,
    setShowDeleteDialog,
    setDepositToDelete,
    confirmDeleteDeposit
  };
};
