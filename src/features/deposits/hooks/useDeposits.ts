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
      console.log("Beginning deletion process for deposit:", deposit);
      console.log("Deposit ID type:", typeof deposit.id, "Value:", deposit.id);
      
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      
      const stringifiedId = deposit.id.toString();
      console.log("Stringified ID:", stringifiedId, "Type:", typeof stringifiedId);
      
      const logEntry = {
        original_id: stringifiedId,
        operation_type: 'deposit',
        client_name: deposit.client_name,
        amount: Number(deposit.amount),
        operation_date: deposit.operation_date || deposit.created_at,
        reason: deposit.description || null,
        from_client: deposit.client_name,
        to_client: deposit.client_name,
        deleted_by: userId || null,
        deleted_at: new Date().toISOString(),
      };
      
      console.log("Data to insert into deleted_transfers_log:", logEntry);
      console.log("Structure of data to be inserted:");
      Object.entries(logEntry).forEach(([key, value]) => {
        console.log(`- ${key}: ${value} (type: ${typeof value})`);
      });
      
      const { error: logError } = await supabase
        .from('deleted_transfers_log')
        .insert(logEntry);
        
      if (logError) {
        console.error("Error logging deposit deletion:", logError);
        console.error("Details:", logError.message, logError.details, logError.hint);
        toast.error("Erreur lors de la création du log de suppression");
        return false;
      }
      
      console.log("Successfully logged deletion");
      
      const { error: deleteError } = await supabase
        .from('deposits')
        .delete()
        .eq('id', deposit.id);
        
      if (deleteError) {
        console.error("Error deleting deposit:", deleteError);
        toast.error("Erreur lors de la suppression du versement");
        return false;
      }
      
      console.log("Deposit successfully deleted");
      
      setDeposits(prevDeposits => 
        prevDeposits.filter(d => d.id !== deposit.id)
      );
      
      toast.success("Versement supprimé", {
        description: `Le versement a été retiré de la base de données.`
      });
      
      return true;
    } catch (error) {
      console.error("Critical error during deposit deletion:", error);
      toast.error("Erreur lors de la suppression du versement");
      return false;
    }
  };

  const confirmDeleteDeposit = async () => {
    if (!depositToDelete) return false;
    
    setIsLoading(true);
    
    try {
      console.log("Début de la suppression du versement avec ID:", depositToDelete.id);
      console.log("Type de l'ID:", typeof depositToDelete.id);
      
      const success = await deleteDeposit(depositToDelete);
      
      if (success) {
        setDepositToDelete(null);
        setShowDeleteDialog(false);
        return true;
      } else {
        throw new Error("Échec de la suppression du versement");
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast.error("Erreur lors de la suppression du versement");
      return false;
    } finally {
      setIsLoading(false);
      setDepositToDelete(null);
      setShowDeleteDialog(false);
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
    confirmDeleteDeposit
  };
};
