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
        .order('created_at', { ascending: false });

      if (depositsError) throw depositsError;

      // Récupérer les retraits
      const { data: withdrawals, error: withdrawalsError } = await supabase
        .from('withdrawals')
        .select('*')
        .order('created_at', { ascending: false });

      if (withdrawalsError) throw withdrawalsError;

      // Récupérer les virements
      const { data: transfers, error: transfersError } = await supabase
        .from('transfers')
        .select('*')
        .order('created_at', { ascending: false });

      if (transfersError) throw transfersError;

      // Transformer les données en format unifié
      const formattedOperations: Operation[] = [
        ...deposits.map((d): Operation => ({
          id: d.id.toString(),
          type: "deposit",
          amount: d.amount,
          date: d.operation_date,
          createdAt: d.created_at,
          description: `Versement de ${d.client_name}`,
          fromClient: d.client_name,
          formattedDate: formatDateTime(d.created_at)
        })),
        ...withdrawals.map((w): Operation => ({
          id: w.id,
          type: "withdrawal",
          amount: w.amount,
          date: w.operation_date,
          createdAt: w.created_at,
          description: `Retrait par ${w.client_name}`,
          fromClient: w.client_name,
          formattedDate: formatDateTime(w.created_at)
        })),
        ...transfers.map((t): Operation => ({
          id: t.id,
          type: "transfer",
          amount: t.amount,
          date: t.operation_date,
          createdAt: t.created_at,
          description: t.reason,
          fromClient: t.from_client,
          toClient: t.to_client,
          formattedDate: formatDateTime(t.created_at)
        }))
      ].sort((a, b) => new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime());

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
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      
      console.log(`Début de la suppression de l'opération: ${operationToDelete.type} avec l'ID: ${operationToDelete.id}`);
      console.log("Type de l'ID:", typeof operationToDelete.id);
      
      // Création d'un objet commun pour l'enregistrement dans deleted_transfers_log
      const currentDate = new Date().toISOString();
      const commonLogData = {
        deleted_by: userId || null,
        deleted_at: currentDate,
      };
      
      switch (operationToDelete.type) {
        case "deposit":
          // Récupérer les détails du versement avant la suppression
          const { data: depositData, error: depositFetchError } = await supabase
            .from('deposits')
            .select('*')
            .eq('id', parseInt(operationToDelete.id))
            .single();
            
          if (depositFetchError) {
            console.error("Erreur lors de la récupération du versement:", depositFetchError);
            throw depositFetchError;
          } else if (depositData) {
            console.log("Enregistrement dans deleted_transfers_log du versement:", depositData);
            console.log("Type de l'ID:", typeof depositData.id);
            
            // Préparation des données pour l'insertion
            const depositLogEntry = {
              ...commonLogData,
              original_id: depositData.id.toString(), // Conversion explicite en string
              operation_type: 'deposit',
              client_name: depositData.client_name,
              amount: Number(depositData.amount),
              operation_date: depositData.operation_date,
              reason: depositData.notes || null,
              from_client: depositData.client_name,
              to_client: depositData.client_name,
            };
            
            console.log("Données à insérer dans deleted_transfers_log pour le versement:", depositLogEntry);
            
            // Enregistrer dans deleted_transfers_log
            const { data: depositLogData, error: depositLogError } = await supabase
              .from('deleted_transfers_log')
              .insert(depositLogEntry)
              .select();
            
            if (depositLogError) {
              console.error("Erreur lors de l'enregistrement dans deleted_transfers_log:", depositLogError);
              console.error("Détails de l'erreur:", depositLogError.message, depositLogError.details, depositLogError.hint);
              throw depositLogError;
            } else {
              console.log("Versement enregistré avec succès dans deleted_transfers_log:", depositLogData);
            }
            
            // Supprimer le versement
            const { error: depositError } = await supabase
              .from('deposits')
              .delete()
              .eq('id', parseInt(operationToDelete.id));
              
            if (depositError) {
              console.error("Erreur lors de la suppression du versement:", depositError);
              throw depositError;
            }
            
            console.log("Versement supprimé avec succès");
          }
          break;
          
        case "withdrawal":
          // Récupérer les détails du retrait avant la suppression
          const { data: withdrawalData, error: withdrawalFetchError } = await supabase
            .from('withdrawals')
            .select('*')
            .eq('id', operationToDelete.id)
            .single();
            
          if (withdrawalFetchError) {
            console.error("Erreur lors de la récupération du retrait:", withdrawalFetchError);
            throw withdrawalFetchError;
          } else if (withdrawalData) {
            console.log("Enregistrement dans deleted_transfers_log du retrait:", withdrawalData);
            console.log("Type de l'ID:", typeof withdrawalData.id);
            
            // Préparation des données pour l'insertion
            const withdrawalLogEntry = {
              ...commonLogData,
              original_id: withdrawalData.id,
              operation_type: 'withdrawal',
              client_name: withdrawalData.client_name,
              amount: Number(withdrawalData.amount),
              operation_date: withdrawalData.operation_date,
              reason: withdrawalData.notes || null,
              from_client: withdrawalData.client_name,
              to_client: withdrawalData.client_name,
            };
            
            console.log("Données à insérer dans deleted_transfers_log pour le retrait:", withdrawalLogEntry);
            
            // Enregistrer dans deleted_transfers_log
            const { data: withdrawalLogData, error: withdrawalLogError } = await supabase
              .from('deleted_transfers_log')
              .insert(withdrawalLogEntry)
              .select();
            
            if (withdrawalLogError) {
              console.error("Erreur lors de l'enregistrement dans deleted_transfers_log:", withdrawalLogError);
              console.error("Détails de l'erreur:", withdrawalLogError.message, withdrawalLogError.details, withdrawalLogError.hint);
              throw withdrawalLogError;
            } else {
              console.log("Retrait enregistré avec succès dans deleted_transfers_log:", withdrawalLogData);
            }
            
            // Supprimer le retrait
            const { error: withdrawalError } = await supabase
              .from('withdrawals')
              .delete()
              .eq('id', operationToDelete.id);
              
            if (withdrawalError) {
              console.error("Erreur lors de la suppression du retrait:", withdrawalError);
              throw withdrawalError;
            }
            
            console.log("Retrait supprimé avec succès");
          }
          break;
          
        case "transfer":
          // Récupérer les détails du virement avant la suppression
          const { data: transferData, error: transferFetchError } = await supabase
            .from('transfers')
            .select('*')
            .eq('id', operationToDelete.id)
            .single();
            
          if (transferFetchError) {
            console.error("Erreur lors de la récupération du virement:", transferFetchError);
            throw transferFetchError;
          } else if (transferData) {
            console.log("Enregistrement dans deleted_transfers_log du virement:", transferData);
            console.log("Type de l'ID:", typeof transferData.id);
            
            // Préparation des données pour l'insertion
            const transferLogEntry = {
              ...commonLogData,
              original_id: transferData.id,
              operation_type: 'transfer',
              amount: Number(transferData.amount),
              operation_date: transferData.operation_date,
              reason: transferData.reason,
              from_client: transferData.from_client,
              to_client: transferData.to_client,
              client_name: transferData.from_client, // Utiliser le client source comme client principal
            };
            
            console.log("Données à insérer dans deleted_transfers_log pour le virement:", transferLogEntry);
            
            // Enregistrer dans deleted_transfers_log
            const { data: transferLogData, error: transferLogError } = await supabase
              .from('deleted_transfers_log')
              .insert(transferLogEntry)
              .select();
            
            if (transferLogError) {
              console.error("Erreur lors de l'enregistrement dans deleted_transfers_log:", transferLogError);
              console.error("Détails de l'erreur:", transferLogError.message, transferLogError.details, transferLogError.hint);
              throw transferLogError;
            } else {
              console.log("Virement enregistré avec succès dans deleted_transfers_log:", transferLogData);
            }
            
            // Supprimer le virement
            const { error: transferError } = await supabase
              .from('transfers')
              .delete()
              .eq('id', operationToDelete.id);
              
            if (transferError) {
              console.error("Erreur lors de la suppression du virement:", transferError);
              throw transferError;
            }
            
            console.log("Virement supprimé avec succès");
          }
          break;
      }
      
      toast.success("Opération supprimée avec succès");
      await fetchAllOperations();
    } catch (error: any) {
      console.error("Erreur lors de la suppression de l'opération:", error);
      toast.error("Erreur lors de la suppression de l'opération", {
        description: error.message || "Une erreur s'est produite lors de la suppression."
      });
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
