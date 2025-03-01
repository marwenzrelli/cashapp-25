import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { type Deposit } from "@/components/deposits/types";
import { useNavigate } from "react-router-dom";

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

      try {
        const { error: logError } = await supabase
          .from('deleted_transfers_log')
          .insert({
            original_id: depositToDelete.id.toString(),
            from_client: depositToDelete.client_name,
            to_client: depositToDelete.client_name,
            amount: depositToDelete.amount,
            operation_date: depositToDelete.operation_date,
            operation_type: 'deposit',
            reason: depositToDelete.notes || 'Aucune raison fournie',
            deleted_at: new Date().toISOString(),
            client_name: depositToDelete.client_name
          });

        if (logError) {
          console.error("Erreur lors de la création du log de suppression:", logError);
        } else {
          console.log("Log de suppression créé avec succès");
        }
      } catch (logError) {
        console.error("Exception lors de la création du log:", logError);
      }

      const { error: deleteError } = await supabase
        .from('deposits')
        .delete()
        .eq('id', depositId);

      if (deleteError) {
        throw new Error(`Erreur lors de la suppression du dépôt: ${deleteError.message}`);
      }

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
    
    setIsLoading(true);
    
    try {
      console.log("Confirmation de la suppression du versement:", depositToDelete);
      
      const success = await deleteDeposit(depositToDelete.id);
      
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
