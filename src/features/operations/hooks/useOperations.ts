
import { useState, useEffect } from "react";
import { Operation } from "../types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useOperations = () => {
  const [operations, setOperations] = useState<Operation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [operationToDelete, setOperationToDelete] = useState<Operation | undefined>(undefined);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const fetchAllOperations = async () => {
    try {
      // Récupérer les versements
      const { data: deposits, error: depositsError } = await supabase
        .from('deposits')
        .select('*')
        .order('operation_date', { ascending: false });

      if (depositsError) throw depositsError;

      // Récupérer les retraits
      const { data: withdrawals, error: withdrawalsError } = await supabase
        .from('withdrawals')
        .select('*')
        .order('operation_date', { ascending: false });

      if (withdrawalsError) throw withdrawalsError;

      // Récupérer les virements
      const { data: transfers, error: transfersError } = await supabase
        .from('transfers')
        .select('*')
        .order('operation_date', { ascending: false });

      if (transfersError) throw transfersError;

      // Transformer les données en format unifié
      const formattedOperations: Operation[] = [
        ...deposits.map((d): Operation => ({
          id: d.id.toString(),
          type: "deposit",
          amount: d.amount,
          date: d.operation_date,
          description: `Versement de ${d.client_name}`,
          fromClient: d.client_name
        })),
        ...withdrawals.map((w): Operation => ({
          id: w.id,
          type: "withdrawal",
          amount: w.amount,
          date: w.operation_date,
          description: `Retrait par ${w.client_name}`,
          fromClient: w.client_name
        })),
        ...transfers.map((t): Operation => ({
          id: t.id,
          type: "transfer",
          amount: t.amount,
          date: t.operation_date,
          description: t.reason,
          fromClient: t.from_client,
          toClient: t.to_client
        }))
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setOperations(formattedOperations);
    } catch (error) {
      console.error("Erreur lors du chargement des opérations:", error);
      toast.error("Erreur lors du chargement des opérations");
    } finally {
      setIsLoading(false);
    }
  };
  
  const deleteOperation = async (operation: Operation) => {
    setOperationToDelete(operation);
    setShowDeleteDialog(true);
  };
  
  const confirmDeleteOperation = async () => {
    if (!operationToDelete) return;
    
    try {
      setIsLoading(true);
      let error;
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      
      switch (operationToDelete.type) {
        case "deposit":
          // Récupérer les détails du versement avant la suppression
          const { data: depositData } = await supabase
            .from('deposits')
            .select('*')
            .eq('id', parseInt(operationToDelete.id))
            .single();
            
          if (depositData) {
            // Enregistrer dans deleted_transfers_log
            await supabase.from('deleted_transfers_log').insert({
              original_id: operationToDelete.id,
              operation_type: 'deposit',
              client_name: depositData.client_name,
              amount: depositData.amount,
              operation_date: depositData.operation_date,
              reason: depositData.notes || null,
              from_client: depositData.client_name, // Pour maintenir la structure de la table
              to_client: depositData.client_name, // Pour maintenir la structure de la table
              deleted_by: userId || null,
            });
          }
            
          // Supprimer le versement
          const { error: depositError } = await supabase
            .from('deposits')
            .delete()
            .eq('id', parseInt(operationToDelete.id));
          error = depositError;
          break;
          
        case "withdrawal":
          // Récupérer les détails du retrait avant la suppression
          const { data: withdrawalData } = await supabase
            .from('withdrawals')
            .select('*')
            .eq('id', operationToDelete.id)
            .single();
            
          if (withdrawalData) {
            // Enregistrer dans deleted_transfers_log
            await supabase.from('deleted_transfers_log').insert({
              original_id: operationToDelete.id,
              operation_type: 'withdrawal',
              client_name: withdrawalData.client_name,
              amount: withdrawalData.amount,
              operation_date: withdrawalData.operation_date,
              reason: withdrawalData.notes || null,
              from_client: withdrawalData.client_name, // Pour maintenir la structure de la table
              to_client: withdrawalData.client_name, // Pour maintenir la structure de la table
              deleted_by: userId || null,
            });
          }
          
          // Supprimer le retrait
          const { error: withdrawalError } = await supabase
            .from('withdrawals')
            .delete()
            .eq('id', operationToDelete.id);
          error = withdrawalError;
          break;
          
        case "transfer":
          // Récupérer les détails du virement avant la suppression
          const { data: transferData } = await supabase
            .from('transfers')
            .select('*')
            .eq('id', operationToDelete.id)
            .single();
            
          if (transferData) {
            // Enregistrer dans deleted_transfers_log
            await supabase.from('deleted_transfers_log').insert({
              original_id: operationToDelete.id,
              operation_type: 'transfer',
              from_client: transferData.from_client,
              to_client: transferData.to_client,
              amount: transferData.amount,
              reason: transferData.reason,
              operation_date: transferData.operation_date,
              deleted_by: userId || null,
            });
          }
          
          // Supprimer le virement
          const { error: transferError } = await supabase
            .from('transfers')
            .delete()
            .eq('id', operationToDelete.id);
          error = transferError;
          break;
      }
      
      if (error) throw error;
      
      toast.success("Opération supprimée avec succès");
      fetchAllOperations();
    } catch (error) {
      console.error("Erreur lors de la suppression de l'opération:", error);
      toast.error("Erreur lors de la suppression de l'opération");
    } finally {
      setShowDeleteDialog(false);
      setOperationToDelete(undefined);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllOperations();
  }, []);

  return {
    operations,
    isLoading,
    fetchOperations: fetchAllOperations,
    deleteOperation,
    showDeleteDialog,
    setShowDeleteDialog,
    confirmDeleteOperation,
    operationToDelete
  };
};
