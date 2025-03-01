import { useState, useEffect } from "react";
import { Operation, formatDateTime } from "../types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useOperations = () => {
  const [operations, setOperations] = useState<Operation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [operationToDelete, setOperationToDelete] = useState<Operation | undefined>(undefined);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const fetchAllOperations = async () => {
    try {
      const { data: deposits, error: depositsError } = await supabase
        .from('deposits')
        .select('*')
        .order('created_at', { ascending: false });

      if (depositsError) throw depositsError;

      const { data: withdrawals, error: withdrawalsError } = await supabase
        .from('withdrawals')
        .select('*')
        .order('created_at', { ascending: false });

      if (withdrawalsError) throw withdrawalsError;

      const { data: transfers, error: transfersError } = await supabase
        .from('transfers')
        .select('*')
        .order('created_at', { ascending: false });

      if (transfersError) throw transfersError;

      const formattedOperations: Operation[] = [
        ...deposits.map((d): Operation => ({
          id: d.id.toString(),
          type: "deposit",
          amount: d.amount,
          date: d.created_at,
          createdAt: d.created_at,
          description: `Versement de ${d.client_name}`,
          fromClient: d.client_name,
          formattedDate: formatDateTime(d.created_at)
        })),
        ...withdrawals.map((w): Operation => ({
          id: w.id,
          type: "withdrawal",
          amount: w.amount,
          date: w.created_at,
          createdAt: w.created_at,
          description: `Retrait par ${w.client_name}`,
          fromClient: w.client_name,
          formattedDate: formatDateTime(w.created_at)
        })),
        ...transfers.map((t): Operation => ({
          id: t.id,
          type: "transfer",
          amount: t.amount,
          date: t.created_at,
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
      
      const currentDate = new Date().toISOString();
      
      switch (operationToDelete.type) {
        case "deposit":
          const { data: depositData, error: depositFetchError } = await supabase
            .from('deposits')
            .select('*')
            .eq('id', parseInt(operationToDelete.id.toString()))
            .single();
            
          if (depositFetchError) {
            console.error("Erreur lors de la récupération du versement:", depositFetchError);
            throw depositFetchError;
          } else if (depositData) {
            console.log("Enregistrement dans deleted_deposits du versement:", depositData);
            
            const { data: depositLogData, error: depositLogError } = await supabase
              .from('deleted_deposits')
              .insert({
                original_id: depositData.id,
                client_name: depositData.client_name,
                amount: Number(depositData.amount),
                operation_date: depositData.operation_date,
                notes: depositData.notes || null,
                deleted_by: userId,
                status: depositData.status
              })
              .select();
            
            if (depositLogError) {
              console.error("Erreur lors de l'enregistrement dans deleted_deposits:", depositLogError);
              throw depositLogError;
            } else {
              console.log("Versement enregistré avec succès dans deleted_deposits:", depositLogData);
            }
            
            const { error: depositError } = await supabase
              .from('deposits')
              .delete()
              .eq('id', parseInt(operationToDelete.id.toString()));
              
            if (depositError) {
              console.error("Erreur lors de la suppression du versement:", depositError);
              throw depositError;
            }
            
            console.log("Versement supprimé avec succès");
          }
          break;
          
        case "withdrawal":
          const { data: withdrawalData, error: withdrawalFetchError } = await supabase
            .from('withdrawals')
            .select('*')
            .eq('id', operationToDelete.id)
            .single();
            
          if (withdrawalFetchError) {
            console.error("Erreur lors de la récupération du retrait:", withdrawalFetchError);
            throw withdrawalFetchError;
          } else if (withdrawalData) {
            console.log("Enregistrement dans deleted_withdrawals du retrait:", withdrawalData);
            
            const { data: withdrawalLogData, error: withdrawalLogError } = await supabase
              .from('deleted_withdrawals')
              .insert({
                original_id: withdrawalData.id,
                client_name: withdrawalData.client_name,
                amount: Number(withdrawalData.amount),
                operation_date: withdrawalData.operation_date,
                notes: withdrawalData.notes || null,
                deleted_by: userId,
                status: withdrawalData.status
              })
              .select();
            
            if (withdrawalLogError) {
              console.error("Erreur lors de l'enregistrement dans deleted_withdrawals:", withdrawalLogError);
              throw withdrawalLogError;
            } else {
              console.log("Retrait enregistré avec succès dans deleted_withdrawals:", withdrawalLogData);
            }
            
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
          const { data: transferData, error: transferFetchError } = await supabase
            .from('transfers')
            .select('*')
            .eq('id', operationToDelete.id)
            .single();
            
          if (transferFetchError) {
            console.error("Erreur lors de la récupération du virement:", transferFetchError);
            throw transferFetchError;
          } else if (transferData) {
            console.log("Enregistrement dans deleted_transfers du virement:", transferData);
            
            const { data: transferLogData, error: transferLogError } = await supabase
              .from('deleted_transfers')
              .insert({
                original_id: transferData.id,
                from_client: transferData.from_client,
                to_client: transferData.to_client,
                amount: Number(transferData.amount),
                operation_date: transferData.operation_date,
                reason: transferData.reason,
                deleted_by: userId,
                status: transferData.status
              })
              .select();
            
            if (transferLogError) {
              console.error("Erreur lors de l'enregistrement dans deleted_transfers:", transferLogError);
              throw transferLogError;
            } else {
              console.log("Virement enregistré avec succès dans deleted_transfers:", transferLogData);
            }
            
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
